import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeObject } from '../utils/validators.js';
import {
  sendOrderConfirmationEmail,
  sendPaymentVerifiedEmail,
  sendPaymentRejectedEmail,
} from '../services/emailService.js';

export const broadcastOrderRealtime = (payload) => {
  try {
    const channel = supabaseAdmin.channel('admin-orders-live-sync');
    channel.send({
      type: 'broadcast',
      event: 'order_changed',
      payload: payload || {},
    }).catch(() => {});
  } catch (e) {
    // silent catch
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = sanitizeObject(req.body);

    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(id, name, price, stock)')
      .eq('user_id', userId);

    if (cartError) throw cartError;
    const validItems = (cartItems || []).filter(item => item.products);
    if (validItems.length === 0) {
      return sendError(res, 'Your cart is empty or products are no longer available', 400);
    }

    for (const item of validItems) {
      if (item.quantity > (item.products?.stock ?? 0)) {
        return sendError(res, `Insufficient stock for ${item.products?.name || 'an item'}`, 400);
      }
    }

    let addressId = orderData.address_id;
    if (!addressId && orderData.address) {
      const { data: newAddress, error: addrError } = await supabaseAdmin
        .from('addresses')
        .insert({
          user_id: userId,
          ...orderData.address,
        })
        .select()
        .single();
      if (addrError) throw addrError;
      addressId = newAddress.id;
    }

    const totalAmount = validItems.reduce(
      (sum, item) => sum + (item.products?.price || 0) * item.quantity, 0
    );

    const isUPI = orderData.payment_method?.includes('UPI') || orderData.payment_method?.includes('QR');
    const paymentStatus = isUPI ? 'pending_verification' : 'not_applicable';
    const orderStatus = isUPI ? 'Payment Submitted' : 'Order Placed';

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        address_id: addressId,
        total_amount: totalAmount,
        status: orderStatus,
        payment_method: orderData.payment_method || 'UPI / QR Code',
        payment_id: orderData.payment_id || null,
        payment_proof_url: orderData.payment_proof_url || null,
        payment_status: paymentStatus,
        order_notes: orderData.order_notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = validItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
      product_name: item.products.name,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    for (const item of validItems) {
      await supabaseAdmin
        .from('products')
        .update({ stock: item.products.stock - item.quantity })
        .eq('id', item.product_id);
    }

    await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    const { data: fullOrder } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_urls)), addresses(*)')
      .eq('id', order.id)
      .single();

    // Trigger order confirmation email in background
    if (req.user?.email) {
      sendOrderConfirmationEmail({
        order: fullOrder || order,
        customerEmail: req.user.email,
        customerName: req.user.profile?.full_name || req.user.email,
      }).catch(err => console.warn('Order confirmation email error:', err));
    }

    broadcastOrderRealtime(fullOrder || order);
    return sendSuccess(res, fullOrder, 'Order placed successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_urls)), addresses(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return sendSuccess(res, {
      orders: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.profile?.role === 'admin';

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, image_urls, price)), addresses(*), profiles:user_id(full_name, email, phone)')
      .eq('id', id);

    if (!isAdmin) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) return sendError(res, 'Order not found', 404);

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const trackOrder = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) return sendError(res, 'Order ID is required', 400);
    id = id.trim().toLowerCase().replace(/^#/, '').replace(/^ord-/, '');

    const selectQuery = 'id, status, payment_status, payment_method, payment_id, total_amount, expected_delivery_date, tracking_number, courier_name, payment_notes, order_notes, created_at, updated_at, order_items(*, products(id, name, image_urls, price, specs)), addresses(*), profiles:user_id(full_name, email, phone)';

    if (id.length === 36) {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .select(selectQuery)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return sendError(res, 'Order not found', 404);
      return sendSuccess(res, data);
    }

    // For short IDs (8 chars, e.g. 83e1c52e), query recent orders and match prefix
    const { data: recentOrders, error } = await supabaseAdmin
      .from('orders')
      .select(selectQuery)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const matched = (recentOrders || []).find((o) => o.id.toLowerCase().startsWith(id));
    if (!matched) return sendError(res, 'Order not found. Please check your tracking ID.', 404);

    return sendSuccess(res, matched);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expected_delivery_date, tracking_number, courier_name } = req.body;

    const validStatuses = [
      'Order Placed', 'Confirmed', 'Packed', 'Shipped',
      'Out for Delivery', 'Delivered', 'Cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return sendError(res, 'Invalid status', 400);
    }

    const updates = { 
      status,
      updated_at: new Date().toISOString()
    };
    if (expected_delivery_date) updates.expected_delivery_date = expected_delivery_date;
    if (tracking_number) updates.tracking_number = tracking_number;
    if (courier_name) updates.courier_name = courier_name;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, order_items(*, products(name, image_urls, price)), addresses(*), profiles:user_id(full_name, email, phone)')
      .single();

    if (error) throw error;

    if (status === 'Cancelled') {
      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', id);

      for (const item of orderItems) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabaseAdmin
            .from('products')
            .update({ stock: product.stock + item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    // In-app Notification for customer
    if (data?.user_id) {
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: data.user_id,
          order_id: id,
          title: `Order Status: ${status}`,
          message: `Your order #${id.slice(0, 8).toUpperCase()} is now ${status}.${expected_delivery_date ? ` Expected delivery: ${expected_delivery_date}.` : ''}${tracking_number ? ` Tracking ID: ${tracking_number} (${courier_name || 'Express'}).` : ''}`,
          type: 'delivery',
          metadata: { status, expected_delivery_date, tracking_number, courier_name }
        });
      } catch (err) {
        console.warn('[Notifications] insert error:', err);
      }
    }

    broadcastOrderRealtime(data);
    return sendSuccess(res, data, 'Order status updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('*, profiles:user_id(full_name, email, phone), order_items(*, products(name, image_urls, price)), addresses(*)', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const cleanSearch = (search || '').trim();
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSearch);
    if (isUUID) {
      query = query.eq('id', cleanSearch);
    }

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    let filteredOrders = data || [];
    if (cleanSearch && !isUUID) {
      const s = cleanSearch.toLowerCase().replace(/^#/, '');
      filteredOrders = filteredOrders.filter(o =>
        o.id.toLowerCase().startsWith(s) ||
        o.payment_id?.toLowerCase().includes(s) ||
        o.profiles?.full_name?.toLowerCase().includes(s) ||
        o.profiles?.email?.toLowerCase().includes(s) ||
        o.addresses?.full_name?.toLowerCase().includes(s) ||
        o.addresses?.city?.toLowerCase().includes(s) ||
        o.addresses?.phone?.includes(s)
      );
    }

    return sendSuccess(res, {
      orders: filteredOrders,
      total: cleanSearch && !isUUID ? filteredOrders.length : count,
      page: parseInt(page),
      totalPages: Math.ceil((cleanSearch && !isUUID ? filteredOrders.length : count) / parseInt(limit)),
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return sendError(res, error.message);
  }
};

export const submitPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { payment_id, payment_proof_url } = req.body;

    if (!payment_id && !payment_proof_url) {
      return sendError(res, 'Payment transaction ID or proof screenshot is required', 400);
    }

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*, profiles:user_id(email, full_name)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !order) {
      return sendError(res, 'Order not found', 404);
    }

    const updates = {
      payment_status: 'pending_verification',
      status: 'Processing',
      updated_at: new Date().toISOString(),
    };
    if (payment_id) updates.payment_id = payment_id;
    if (payment_proof_url) updates.payment_proof_url = payment_proof_url;

    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, order_items(*, products(name, image_urls)), addresses(*), profiles:user_id(full_name, email, phone)')
      .single();

    if (updateErr) throw updateErr;

    // Send in-app notification confirming receipt of proof
    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        order_id: id,
        title: 'Payment Proof Received',
        message: `We received your UTR reference ${payment_id || 'receipt'} for Order #${id.slice(0, 8).toUpperCase()}. Verification is in progress.`,
        type: 'payment',
      });
    } catch (err) {
      console.warn('[Notifications] insert error:', err);
    }

    broadcastOrderRealtime(updatedOrder);
    return sendSuccess(res, updatedOrder, 'Payment proof submitted successfully for verification');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const verifyOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes, expected_delivery_date, tracking_number, courier_name } = req.body; // 'verify' | 'reject'

    if (!['verify', 'reject'].includes(action)) {
      return sendError(res, 'Action must be either "verify" or "reject"', 400);
    }

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*, profiles:user_id(email, full_name)')
      .eq('id', id)
      .single();

    if (fetchErr || !order) {
      console.error('[verifyOrderPayment] fetch error:', fetchErr);
      return sendError(res, 'Order not found', 404);
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (action === 'verify') {
      updates.payment_status = 'verified';
      updates.status = 'Confirmed';
      updates.payment_verified_at = new Date().toISOString();
      updates.payment_verified_by = req.admin?.id || req.user?.id || null;
      if (expected_delivery_date) updates.expected_delivery_date = expected_delivery_date;
      if (tracking_number) updates.tracking_number = tracking_number;
      if (courier_name) updates.courier_name = courier_name;
      if (notes) updates.payment_notes = notes;
    } else {
      updates.payment_status = 'rejected';
      if (notes) updates.payment_notes = notes;
    }

    const { data: updatedOrder, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select('*, order_items(*, products(name, image_urls, price)), addresses(*), profiles:user_id(full_name, email, phone)')
      .single();

    if (updateErr) throw updateErr;

    const customerEmail = updatedOrder.profiles?.email || order.profiles?.email;
    const customerName = updatedOrder.profiles?.full_name || order.profiles?.full_name;

    // 1. Dispatch In-App Notification
    if (updatedOrder.user_id) {
      try {
        await supabaseAdmin.from('notifications').insert({
          user_id: updatedOrder.user_id,
          order_id: id,
          title: action === 'verify' ? 'Payment Verified & Confirmed! 🏏' : 'Payment Verification Issue',
          message: action === 'verify' 
            ? `Your payment of ₹${Number(updatedOrder.total_amount).toLocaleString('en-IN')} for Order #${id.slice(0, 8).toUpperCase()} has been approved.${expected_delivery_date ? ` Expected Delivery: ${expected_delivery_date}.` : ''} Tap to view tracking and download invoice.`
            : `Payment proof for Order #${id.slice(0, 8).toUpperCase()} was rejected.${notes ? ` Reason: ${notes}` : ''} Please update payment details.`,
          type: 'payment',
          metadata: {
            expected_delivery_date: updatedOrder.expected_delivery_date,
            tracking_number: updatedOrder.tracking_number,
            courier_name: updatedOrder.courier_name,
          }
        });
      } catch (err) {
        console.warn('[Notifications] insert error:', err);
      }
    }

    // 2. Dispatch Email
    if (customerEmail) {
      if (action === 'verify') {
        sendPaymentVerifiedEmail({
          order: updatedOrder,
          customerEmail,
          customerName,
          expected_delivery_date,
          tracking_number,
          courier_name,
        }).catch(err => console.warn('[EmailService] verify send error:', err));
      } else {
        sendPaymentRejectedEmail({
          order: updatedOrder,
          customerEmail,
          customerName,
          reason: notes,
        }).catch(err => console.warn('[EmailService] reject send error:', err));
      }
    }

    broadcastOrderRealtime(updatedOrder);
    return sendSuccess(
      res,
      updatedOrder,
      action === 'verify' ? 'Payment confirmed and verified successfully' : 'Payment marked as rejected'
    );
  } catch (error) {
    return sendError(res, error.message);
  }
};

