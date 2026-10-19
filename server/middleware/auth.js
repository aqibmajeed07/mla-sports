import { supabaseAdmin } from '../config/supabase.js';
import { sendError } from '../utils/response.js';
import { verifyAdminToken } from '../utils/adminToken.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];

    // 1. Check if this is a dedicated admin token
    const decodedAdmin = verifyAdminToken(token);
    if (decodedAdmin && decodedAdmin.id) {
      const { data: adminUser, error: adminErr } = await supabaseAdmin
        .from('admin_users')
        .select('id, username, email, full_name, role, is_active')
        .eq('id', decodedAdmin.id)
        .single();

      if (!adminErr && adminUser && adminUser.is_active) {
        req.user = {
          id: adminUser.id,
          email: adminUser.email,
          role: 'admin',
          profile: { role: 'admin', full_name: adminUser.full_name },
        };
        req.admin = adminUser;
        req.accessToken = token;
        return next();
      }
    }

    // 2. Otherwise verify customer Supabase user session token
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return sendError(res, 'Invalid or expired token', 401);
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile?.is_blocked) {
      return sendError(res, 'Your account has been blocked. Please contact support.', 403);
    }

    req.user = { ...user, profile };
    req.accessToken = token;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', 401);
  }
};
