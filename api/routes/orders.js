import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  getAllOrders,
  submitPaymentProof,
  verifyOrderPayment,
} from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = Router();

// Public Track Order Route
router.get('/track/:id', trackOrder);

// Admin Dedicated Routes (Directly guarded by requireAdmin)
router.get('/all', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);
router.put('/:id/verify-payment', requireAdmin, verifyOrderPayment);

// Customer Authenticated Routes
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.put('/:id/payment-proof', authenticate, submitPaymentProof);

export default router;
