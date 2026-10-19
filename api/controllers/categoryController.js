import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeString } from '../utils/validators.js';

export const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return sendError(res, 'Category not found', 404);

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const createCategory = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, icon: req.body.icon || null })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return sendError(res, 'Category already exists', 409);
      }
      throw error;
    }

    return sendSuccess(res, data, 'Category created successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const name = sanitizeString(req.body.name);

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ name, icon: req.body.icon })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Category updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};
