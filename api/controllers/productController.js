import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeObject } from '../utils/validators.js';

export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, order, page = 1, limit = 12, featured } = req.query;

    let query = supabaseAdmin
      .from('products')
      .select('*, categories(name)', { count: 'exact' });

    if (search) query = query.ilike('name', `%${search}%`);
    if (category) query = query.eq('category_id', category);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (featured === 'true') query = query.eq('is_featured', true);

    const sortField = sort || 'created_at';
    const sortOrder = order === 'asc' ? true : false;
    query = query.order(sortField, { ascending: sortOrder });

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return sendSuccess(res, {
      products: data,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
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

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const lookupSlug = SLUG_ALIASES[id] || id;

    let query = supabaseAdmin
      .from('products')
      .select('*, categories(name)');

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', lookupSlug);
    }

    let { data, error } = await query.maybeSingle();

    // If not found and not a UUID, try fuzzy matching
    if (!data && !isUuid) {
      const { data: fallback } = await supabaseAdmin
        .from('products')
        .select('*, categories(name)')
        .ilike('slug', `%${lookupSlug.replace(/^mla-/, '')}%`)
        .limit(1)
        .maybeSingle();
      if (fallback) data = fallback;
    }

    if (error) throw error;
    if (!data) return sendError(res, 'Product not found', 404);

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const rateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user?.id;

    if (!rating || rating < 1 || rating > 5) {
      return sendError(res, 'Rating must be between 1 and 5', 400);
    }

    // Get current product rating
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('rating, rating_count')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Check if user has already rated (using product_ratings table if exists, otherwise simple average)
    let newRating, newCount;

    // Check for existing user rating record
    const { data: existingRating } = await supabaseAdmin
      .from('product_ratings')
      .select('id, rating')
      .eq('product_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingRating) {
      // Update existing rating: recalculate average
      const totalScore = product.rating * product.rating_count - existingRating.rating + rating;
      newRating = totalScore / product.rating_count;
      newCount = product.rating_count;

      await supabaseAdmin
        .from('product_ratings')
        .update({ rating })
        .eq('id', existingRating.id);
    } else {
      // New rating
      newRating = (product.rating * product.rating_count + rating) / (product.rating_count + 1);
      newCount = product.rating_count + 1;

      await supabaseAdmin
        .from('product_ratings')
        .insert({ product_id: id, user_id: userId, rating });
    }

    // Update product average rating
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        rating: Math.round(newRating * 10) / 10,
        rating_count: newCount,
      })
      .eq('id', id)
      .select('*, categories(name)')
      .single();

    if (updateError) throw updateError;

    return sendSuccess(res, updated, 'Rating submitted successfully');
  } catch (error) {
    // If product_ratings table doesn't exist, fallback to simple running average
    if (error.message?.includes('product_ratings') || error.code === '42P01') {
      try {
        const { id } = req.params;
        const { rating } = req.body;
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('rating, rating_count')
          .eq('id', id)
          .single();

        const newCount = product.rating_count + 1;
        const newRating = (product.rating * product.rating_count + rating) / newCount;

        const { data: updated } = await supabaseAdmin
          .from('products')
          .update({
            rating: Math.round(newRating * 10) / 10,
            rating_count: newCount,
          })
          .eq('id', id)
          .select('*, categories(name)')
          .single();

        return sendSuccess(res, updated, 'Rating submitted');
      } catch (fallbackError) {
        return sendError(res, fallbackError.message);
      }
    }
    return sendError(res, error.message);
  }
};

export const getUserRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const { data, error } = await supabaseAdmin
      .from('product_ratings')
      .select('rating')
      .eq('product_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== '42P01') throw error;

    return sendSuccess(res, { userRating: data?.rating || null });
  } catch (error) {
    return sendSuccess(res, { userRating: null });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = sanitizeObject(req.body);

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: productData.name,
        category_id: productData.category_id || null,
        description: productData.description,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock) || 0,
        image_urls: productData.image_urls || [],
        blade_type: productData.blade_type || 'Kashmir Willow',
        willow_grade: productData.willow_grade || 'Grade 1 Pro',
        weight_range: productData.weight_range || '1160g – 1220g',
        grains_range: productData.grains_range || '6–9 Straight Grains',
        edge_thickness: productData.edge_thickness || '38mm – 42mm',
        sweet_spot: productData.sweet_spot || 'Mid-to-Low Profile',
        rating: 0,
        rating_count: 0,
        is_featured: productData.is_featured || false,
      })
      .select('*, categories(name)')
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Product created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = sanitizeObject(req.body);

    if (updates.price) updates.price = parseFloat(updates.price);
    if (updates.stock) updates.stock = parseInt(updates.stock);

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories(name)')
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Product updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};
