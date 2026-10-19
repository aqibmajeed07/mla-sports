import { supabaseAdmin } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { signAdminToken } from '../utils/adminToken.js';

/**
 * Separate, dedicated administrator login
 * Authenticates against public.admin_users using PostgreSQL pgcrypto
 */
export const adminLogin = async (req, res) => {
  try {
    const { login, email, password } = req.body;
    const credential = (login || email || '').trim();

    if (!credential || !password) {
      return sendError(res, 'Administrator username/email and password are required', 400);
    }

    // Call secure Postgres RPC verify_admin_credentials
    const { data, error } = await supabaseAdmin.rpc('verify_admin_credentials', {
      p_login: credential,
      p_password: password,
    });

    if (error) {
      console.error('Admin authentication RPC error:', error);
      return sendError(res, 'Database error during admin authentication', 500);
    }

    if (!data || data.length === 0) {
      return sendError(res, 'Invalid administrator credentials or inactive account', 401);
    }

    const adminUser = data[0];
    const token = signAdminToken(adminUser);

    return sendSuccess(res, {
      token,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
        phone: adminUser.phone,
        avatar_url: adminUser.avatar_url,
      },
    }, 'Administrator authentication successful');
  } catch (err) {
    console.error('adminLogin exception:', err);
    return sendError(res, err.message || 'Administrator login failed', 500);
  }
};

/**
 * Get current authenticated admin user profile
 */
export const getAdminMe = async (req, res) => {
  try {
    return sendSuccess(res, {
      admin: req.admin,
    });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/**
 * Admin logout
 */
export const adminLogout = async (req, res) => {
  return sendSuccess(res, null, 'Administrator logged out successfully');
};
