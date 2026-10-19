import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .select('*, products(id, name, price, stock, image_urls, rating, categories(name))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    const { data: existing } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      return sendSuccess(res, existing, 'Already in wishlist');
    }

    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .insert({ user_id: userId, product_id })
      .select('*, products(id, name, price, stock, image_urls, rating, categories(name))')
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Added to wishlist', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return sendSuccess(res, null, 'Removed from wishlist');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const removeFromWishlistByProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { error } = await supabaseAdmin
      .from('wishlists')
      .delete()
      .eq('product_id', productId)
      .eq('user_id', userId);

    if (error) throw error;

    return sendSuccess(res, null, 'Removed from wishlist');
  } catch (error) {
    return sendError(res, error.message);
  }
};
