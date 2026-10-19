import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist, removeFromWishlistByProduct } from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:id', removeFromWishlist);
router.delete('/product/:productId', removeFromWishlistByProduct);

export default router;
