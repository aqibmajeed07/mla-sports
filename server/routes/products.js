import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    rateProduct,
    getUserRating,
} from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

// Rating routes (authenticated users)
router.post('/:id/rate', authenticate, rateProduct);
router.get('/:id/my-rating', authenticate, getUserRating);

// Admin routes
router.post('/', authenticate, requireAdmin, validate(['name', 'price']), createProduct);
router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

export default router;
