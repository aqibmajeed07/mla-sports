import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { count: totalProducts } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: totalOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    const { count: totalCustomers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    const { count: pendingOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['Order Placed', 'Confirmed', 'Packed']);

    const { count: deliveredOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Delivered');

    const { count: cancelledOrders } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Cancelled');

    const { data: revenueData } = await supabaseAdmin
      .from('orders')
      .select('total_amount')
      .eq('status', 'Delivered');

    const revenue = revenueData?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;

    const { data: lowStockProducts } = await supabaseAdmin
      .from('products')
      .select('id, name, stock')
      .lte('stock', 5)
      .order('stock', { ascending: true })
      .limit(10);

    return sendSuccess(res, {
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      revenue,
      lowStockProducts: lowStockProducts || [],
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer');

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return sendSuccess(res, {
      customers: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!customer) return sendError(res, 'Customer not found', 404);

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(quantity, price)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return sendSuccess(res, { ...customer, orders: orders || [] });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const toggleBlockCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ is_blocked })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, data, `Customer ${is_blocked ? 'blocked' : 'unblocked'} successfully`);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('id, total_amount, status, created_at, order_items(product_id, quantity, price, product_name)')
      .gte('created_at', daysAgo.toISOString())
      .neq('status', 'Cancelled')
      .order('created_at', { ascending: true });

    const dailySales = {};
    const productSales = {};
    let totalRevenue = 0;

    (orders || []).forEach((order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + parseFloat(order.total_amount);

      if (order.status === 'Delivered') {
        totalRevenue += parseFloat(order.total_amount);
      }

      (order.order_items || []).forEach((item) => {
        const name = item.product_name;
        if (!productSales[name]) {
          productSales[name] = { quantity: 0, revenue: 0 };
        }
        productSales[name].quantity += item.quantity;
        productSales[name].revenue += item.price * item.quantity;
      });
    });

    const { data: categoryData } = await supabaseAdmin
      .from('order_items')
      .select('quantity, products(category_id, categories(name))');

    const categorySales = {};
    (categoryData || []).forEach((item) => {
      const catName = item.products?.categories?.name || 'Uncategorized';
      categorySales[catName] = (categorySales[catName] || 0) + item.quantity;
    });

    const bestSelling = Object.entries(productSales)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10)
      .map(([name, data]) => ({ name, ...data }));

    const topCategories = Object.entries(categorySales)
      .sort((a, b) => b[1] - a[1])
      .map(([name, quantity]) => ({ name, quantity }));

    return sendSuccess(res, {
      dailySales,
      totalRevenue,
      bestSelling,
      topCategories,
      totalOrders: orders?.length || 0,
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};
