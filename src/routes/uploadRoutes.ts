import { Router } from 'express';
import { uploadImage } from '../middlewares/uploadMiddleware.js';
import { StorageService } from '../services/storageService.js';
import { handleControllerError } from '../utils/errorHandler.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = Router();



router.post('/images', verifyToken, uploadImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded.' });
            return;
        }

        // Subida directa a Cloudinary a través del servicio
        const fileUrl = await StorageService.saveFile(req.file);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully to Cloudinary.',
            url: fileUrl
        });
    } catch (error) {
        handleControllerError(res, error, 'Error during file upload');
    }
});

export default router;