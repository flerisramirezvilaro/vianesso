import { Router} from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();



// Ruta para registrar un usuario: POST /api/auth/register
router.post('/register', register);

// Ruta para iniciar sesión: POST /api/auth/login
router.post('/login', login);
export default router;