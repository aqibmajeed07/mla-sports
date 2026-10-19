import express from 'express';
import cors from 'cors';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import notificationRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MLA Sports API', timestamp: new Date().toISOString() });
});

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);

// Mount router under both /api and root to handle Vercel rewrites gracefully
app.use('/api', router);
app.use('/', router);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT} (http://127.0.0.1:${PORT})`);
  });
}

export default app;
