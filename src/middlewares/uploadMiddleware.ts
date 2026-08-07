import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ValidationError } from '../errors/AppError.js';

// Configuración de almacenamiento temporal en memoria
// Esto es ideal porque nos permite procesar el archivo o mandarlo a la nube directamente
const storage = multer.memoryStorage();

// Filtro estricto para validar que el archivo sea una imagen
const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback): void => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new ValidationError('Invalid file type. Only JPEG, PNG and WEBP are allowed.'));
    }
};

// Middleware configurado con límite de 5MB
export const uploadImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 Megabytes
    }
});