import { Router } from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post('/', authenticate, requireAdmin, validate(['name']), createCategory);
router.put('/:id', authenticate, requireAdmin, validate(['name']), updateCategory);
router.delete('/:id', authenticate, requireAdmin, deleteCategory);

export default router;
