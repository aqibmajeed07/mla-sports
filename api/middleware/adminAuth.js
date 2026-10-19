import { verifyAdminToken } from '../utils/adminToken.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendError } from '../utils/response.js';

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Administrator authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    // 1. First, check dedicated admin token from public.admin_users
    const decoded = verifyAdminToken(token);
    if (decoded && decoded.id) {
      const { data: adminUser, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, username, email, full_name, role, phone, is_active')
        .eq('id', decoded.id)
        .single();

      if (!error && adminUser && adminUser.is_active) {
        req.admin = adminUser;
        req.user = {
          id: adminUser.id,
          email: adminUser.email,
          role: 'admin',
          profile: {
            role: 'admin',
            full_name: adminUser.full_name,
          },
        };
        return next();
      }
    }

    // 2. Fallback: Check if request has a legacy Supabase user with admin role
    const { data: { user }, error: sbError } = await supabaseAdmin.auth.getUser(token);
    if (!sbError && user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile && profile.role === 'admin') {
        req.user = { ...user, profile };
        req.admin = {
          id: user.id,
          email: user.email,
          full_name: profile.full_name || 'Admin',
          role: 'admin',
        };
        return next();
      }
    }

    return sendError(res, 'Access Denied: Administrator privileges required', 403);
  } catch (error) {
    console.error('requireAdmin error:', error);
    return sendError(res, 'Administrator authorization failed', 401);
  }
};
