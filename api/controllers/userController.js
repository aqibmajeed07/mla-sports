import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitizeObject } from '../utils/validators.js';

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = sanitizeObject(req.body);

    const allowedFields = ['full_name', 'phone', 'avatar_url'];
    const filteredUpdates = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(filteredUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, data);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressData = sanitizeObject(req.body);

    if (addressData.is_default) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: userId,
        ...addressData,
      })
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Address added successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = sanitizeObject(req.body);

    if (updates.is_default) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return sendSuccess(res, data, 'Address updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return sendSuccess(res, null, 'Address deleted successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};
