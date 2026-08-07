import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import { StorageService } from '../services/storageService.js';

// 1. Mockear el servicio de almacenamiento (Cloudinary)
vi.mock('../services/storageService.js', () => {
    return {
        StorageService: {
            saveFile: vi.fn().mockResolvedValue('https://res.cloudinary.com/mock_account/image/upload/mock_image.png')
        }
    };
});

// 2. Mockear el middleware de autenticación para que deje pasar la petición
vi.mock('../middlewares/authMiddleware.js', () => { // Ajusta la ruta real de tu verifyToken
    return {
        verifyToken: (req: any, res: any, next: any) => {
            // Simulamos que el token es correcto e inyectamos un usuario de prueba
            req.user = { id: 42, role: 'USER' };
            next();
        }
    };
});

describe('POST /api/uploads/images', () => {
    let mockToken: string;

    beforeEach(() => {
        vi.clearAllMocks();
        mockToken = 'Bearer token_simulado';
    });

    it('should upload an image successfully and return the cloud URL', async () => {
        const response = await request(app)
            .post('/api/uploads/images')
            .set('Authorization', mockToken)
            .attach('image', Buffer.from('fake-image-binary-data'), 'test-avatar.png');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: 'File uploaded successfully to Cloudinary.',
            url: 'https://res.cloudinary.com/mock_account/image/upload/mock_image.png'
        });

        expect(StorageService.saveFile).toHaveBeenCalledTimes(1);
    });

    it('should return 400 Bad Request if no file is uploaded', async () => {
        const response = await request(app)
            .post('/api/uploads/images')
            .set('Authorization', mockToken);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    // Nota: Como mockeamos verifyToken globalmente en este archivo, 
    // si necesitas probar el fallo de token ausente, tendrías que comprobarlo validando req.headers directamente en el mock.
});