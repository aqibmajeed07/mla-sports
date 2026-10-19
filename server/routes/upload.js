import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Require authentication for all uploads
router.use(authenticate);

router.post('/', uploadImage);
router.delete('/', deleteImage);

export default router;
