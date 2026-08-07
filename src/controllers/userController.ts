import { Response } from 'express';
import bcrypt from 'bcrypt';
import { PostgresUserReadRepository } from '../repositories/PostgresUserReadRepository.js';
import { PostgresUserWriteRepository } from '../repositories/PostgresUserWriteRepository.js';

import { handleControllerError } from '../utils/errorHandler.js';

import { ValidationError } from '../errors/AppError.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { UserRole } from '../types/index.js';
import { UserValidator } from '../utils/userValidators.js';
import { StorageService } from '../services/storageService.js'

const userReadRepository = new PostgresUserReadRepository();
const userWriteRepository = new PostgresUserWriteRepository();


const ensureUserId = (req: AuthenticatedRequest): string => {
    const userId = req.user?.userId;
    if (!userId || typeof userId !== 'string') {
        throw new ValidationError('Authentication context is missing valid user identity UUID.');
    }
    return userId;
};

/**
 * Obtiene el perfil del usuario autenticado de forma segura
 */
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        
        if (!userId || typeof userId !== 'string') {
            throw new ValidationError('Authentication context is missing user identity. 👤');
        }

        const user = await userReadRepository.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User profile not found.' });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: user.user_id,
                name: user.full_name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatar_url|| ""
            }
        });
    } catch (error) {
        handleControllerError(res, error, 'Error fetching user profile');
    }
};

/**
 * Actualiza los datos permitidos del perfil del usuario
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = ensureUserId(req);

        // 1. Unificamos req.body con los datos del archivo antes de validar
        const updateData = { ...req.body } as Record<string, unknown>;

        if (req.file) {
            updateData.avatar_url = req.file.originalname; 
        }

        // 2. Validamos el objeto completo
        const validatedData = UserValidator.validateUpdateProfile(updateData);

        // 3. Si la validación pasó y efectivamente hay un archivo, lo subimos a Cloudinary
        if (req.file) {
            const avatarUrl = await StorageService.saveFile(req.file);
            validatedData.avatar_url = avatarUrl; // Reemplazamos por la URL real
        }

        // 4. Pasamos 'validatedData' al repositorio (userId ya es string UUID)
        const updatedUser = await userWriteRepository.updateProfile(userId, validatedData);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully! ',
            user: {
                id: updatedUser.user_id,
                name: updatedUser.full_name,
                phone: updatedUser.phone,
                email: updatedUser.email,
                avatar_url: updatedUser.avatar_url || ""
            }
        });

    } catch (error) {
        handleControllerError(res, error, 'Error updating user profile');
    }
};

/**
 * Lista todos los usuarios del sistema (Ruta protegida para ADMIN)
 */
export const getAllUsersAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Control defensivo secundario en el controlador además del middleware
        if (req?.user?.role !== UserRole.ADMIN) {
            res.status(403).json({ success: false, message: 'Unauthorized access. Administrative privileges required. 👑' });
            return;
        }
        const users = await userReadRepository.findAll();

        res.status(200).json({
            success: true,
            users: users.map(u => ({
                id: u.user_id,
                name: u.full_name,
                email: u.email,
                role: u.role,
                avatarUrl: u.avatar_url || ""
            }))
        });
    } catch (error) {
        handleControllerError(res, error, 'Error fetching users registry');
    }
};

/**
 * 🔒 Cambia la contraseña del usuario desde su perfil de forma segura
 */
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = ensureUserId(req);

        // 1. Saneamiento y validación estricta usando snake_case
        const validatedPasswords = UserValidator.validateUpdatePassword(req.body);

        // 2. Obtener el hash actual de la base de datos de forma defensiva
        const user = await userReadRepository.findById(userId);
        if (!user?.password) {
            res.status(404).json({ message: 'User identity not found.' });
            return;
        }

        // 3. Verificar que la contraseña actual ingresada sea correcta
        const isMatch = await bcrypt.compare(validatedPasswords.current_password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'The current password you entered is incorrect.' });
            return;
        }

        // 4. Criptografía defensiva: Generar sal y nuevo Hash
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(validatedPasswords.new_password, salt);

        // 5. Persistir el cambio en el repositorio de escritura
        await userWriteRepository.updatePassword(userId, newPasswordHash);

        res.status(200).json({
            success: true,
            message: 'Password updated successfully! '
        });
    } catch (error) {
        handleControllerError(res, error, 'Error updating user password');
    }
};