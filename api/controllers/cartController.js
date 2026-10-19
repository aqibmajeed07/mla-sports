import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .select('*, products(id, name, price, stock, image_urls, categories(name))')
      .eq('user_id', userId);

    if (error) throw error;

    return sendSuccess(res, data || []);
  } catch (error) {
    return sendError(res, error.message);
  }
};

const SLUG_ALIASES = {
  'mla-leather-pro-grade1': 'mla-pro-edition-grade1-kashmir-willow',
  'mla-kashmir-gold-leather': 'mla-kashmir-gold-grade1-leather-bat',
  'mla-players-reserve-kashmir': 'mla-players-reserve-limited-kashmir-willow',
  'mla-velocity-pro-heavy-tennis': 'mla-velocity-pro-heavy-tennis-bat',
  'mla-strike-light-tennis': 'mla-strike-light-scoop-tennis-bat',
  'mla-thunder-extreme-tennis': 'mla-thunder-extreme-power-scoop-bat',
  'mla-master-pre-knocked-match': 'mla-master-hardball-pre-knocked-bat',
  'mla-club-match-pre-knocked': 'mla-club-match-ready-to-play-bat',
  'mla-bat-maintenance-kit': 'mla-master-bat-care-knocking-kit',
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id);
    const lookupSlug = SLUG_ALIASES[product_id] || product_id;

    let productQuery = supabaseAdmin
      .from('products')
      .select('id, stock');

    if (isUuid) {
      productQuery = productQuery.eq('id', product_id);
    } else {
      productQuery = productQuery.eq('slug', lookupSlug);
    }

    let { data: product } = await productQuery.maybeSingle();

    if (!product && !isUuid) {
      const { data: fallback } = await supabaseAdmin
        .from('products')
        .select('id, stock')
        .ilike('slug', `%${lookupSlug.replace(/^mla-/, '')}%`)
        .limit(1)
        .maybeSingle();
      if (fallback) product = fallback;
    }

    if (!product) return sendError(res, 'Product not found', 404);
    if (product.stock < quantity) return sendError(res, 'Insufficient stock', 400);

    const actualProductId = product.id;

    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('product_id', actualProductId)
      .maybeSingle();

    let data;
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > product.stock) return sendError(res, 'Insufficient stock', 400);

      const { data: updated, error } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existing.id)
        .select('*, products(id, name, price, stock, image_urls, categories(name))')
        .single();
      if (error) throw error;
      data = updated;
    } else {
      const { data: created, error } = await supabaseAdmin
        .from('cart_items')
        .insert({ user_id: userId, product_id: actualProductId, quantity })
        .select('*, products(id, name, price, stock, image_urls, categories(name))')
        .single();
      if (error) throw error;
      data = created;
    }

    return sendSuccess(res, data, 'Added to cart');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) return sendError(res, 'Quantity must be at least 1', 400);

    const { data: cartItem } = await supabaseAdmin
      .from('cart_items')
      .select('product_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!cartItem) return sendError(res, 'Cart item not found', 404);

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('stock')
      .eq('id', cartItem.product_id)
      .single();

    if (!product || quantity > product.stock) return sendError(res, 'Insufficient stock or product unavailable', 400);

    const { data, error } = await supabaseAdmin
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, products(id, name, price, stock, image_urls, categories(name))')
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Cart updated');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return sendSuccess(res, null, 'Removed from cart');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    return sendSuccess(res, null, 'Cart cleared');
  } catch (error) {
    return sendError(res, error.message);
  }
};
