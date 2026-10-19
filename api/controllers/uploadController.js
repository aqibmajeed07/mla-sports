import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const uploadImage = async (req, res) => {
  try {
    const { base64, fileName, contentType, bucket = 'product-images' } = req.body;

    if (!base64 || !fileName) {
      return sendError(res, 'Image data and filename required', 400);
    }

    const isAdmin = req.user?.profile?.role === 'admin';
    const targetBucket = bucket === 'payment-proofs' ? 'payment-proofs' : 'product-images';

    if (targetBucket === 'product-images' && !isAdmin) {
      return sendError(res, 'Access denied: Admin privileges required to manage product catalog images', 403);
    }

    const buffer = Buffer.from(base64, 'base64');
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${cleanFileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from(targetBucket)
      .upload(uniqueName, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabaseAdmin.storage
      .from(targetBucket)
      .getPublicUrl(data.path);

    return sendSuccess(res, { url: urlData.publicUrl, path: data.path }, 'Image uploaded successfully', 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { path, bucket = 'product-images' } = req.body;

    if (!path) {
      return sendError(res, 'Image path required', 400);
    }

    const isAdmin = req.user?.profile?.role === 'admin';
    const targetBucket = bucket === 'payment-proofs' ? 'payment-proofs' : 'product-images';

    if (targetBucket === 'product-images' && !isAdmin) {
      return sendError(res, 'Access denied: Admin privileges required to delete product images', 403);
    }

    const { error } = await supabaseAdmin.storage
      .from(targetBucket)
      .remove([path]);

    if (error) throw error;

    return sendSuccess(res, null, 'Image deleted successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};
