import { Router } from 'express';
import {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  toggleBlockCustomer,
  getAnalytics,
} from '../controllers/adminController.js';
import {
  adminLogin,
  getAdminMe,
  adminLogout,
} from '../controllers/adminAuthController.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Public Admin Auth Endpoint (Strictly separate from customer Supabase auth)
router.post('/login', adminLogin);

// Protected Admin Routes
router.get('/me', requireAdmin, getAdminMe);
router.post('/logout', requireAdmin, adminLogout);

router.get('/dashboard', requireAdmin, getDashboardStats);
router.get('/customers', requireAdmin, getCustomers);
router.get('/customers/:id', requireAdmin, getCustomerById);
router.put('/customers/:id/block', requireAdmin, toggleBlockCustomer);
router.get('/analytics', requireAdmin, getAnalytics);

export default router;
