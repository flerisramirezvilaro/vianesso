import { Router } from 'express';
import { 
    updateUserProfile, 
    updateUserPassword, 
    getAllUsersAdmin, 
    getUserProfile 
} from '../controllers/userController.js';

import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';


const router = Router();

//  Todas las rutas de usuario exigen una sesión activa
router.use(verifyToken);

//  Rutas del Perfil del Usuario
router.get('/profile', getUserProfile);
// En tu archivo de rutas de usuario
router.put('/profile', verifyToken, uploadImage.single('avatar'), updateUserProfile);
router.put('/profile/password', updateUserPassword); // Botón "ACTUALIZAR CONTRASEÑA"

// Rutas Administrativas
router.get('/admin/users', getAllUsersAdmin);

export default router;