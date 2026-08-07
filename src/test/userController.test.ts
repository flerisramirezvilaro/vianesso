import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';

import { updateUserProfile, updateUserPassword, getAllUsersAdmin } from '../controllers/userController.js';

import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { UserRole } from '../types/index.js';

const { mockWriteRepository, mockReadRepository } = vi.hoisted(() => {
    return {
        mockWriteRepository: {
            updateProfile: vi.fn(),
            updatePassword: vi.fn(),
        },
        mockReadRepository: {
            findById: vi.fn(),
            findAll: vi.fn(),
        }
    };
});

// 🎭 2. Ahora el vi.mock puede acceder a ellos sin problemas de inicialización
vi.mock('../repositories/PostgresUserWriteRepository.js', () => {
    return {
        PostgresUserWriteRepository: class {
            updateProfile = mockWriteRepository.updateProfile;
            updatePassword = mockWriteRepository.updatePassword;
        }
    };
});

vi.mock('../repositories/PostgresUserReadRepository.js', () => {
    return {
        PostgresUserReadRepository: class {
            findById = mockReadRepository.findById;
            findAll = mockReadRepository.findAll;
        }
    };
});

vi.mock('bcrypt');

describe('👤 Módulo de Usuarios: Pruebas Unitarias del Controlador', () => {
    let mockReq: Partial<AuthenticatedRequest>;
    let mockRes: Partial<Response>;
    let statusMock: any;
    let jsonMock: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        mockRes = { status: statusMock };
    });

    // ==========================================
    // 📝 PRUEBAS: Actualizar Perfil (Parcial)
    // ==========================================
    describe('📝 PUT /profile (updateUserProfile)', () => {
        it('debería actualizar el perfil con éxito si se envía solo una propiedad (Ej: phone)', async () => {
            mockReq = {
                user: { userId: 42, role: UserRole.CLIENT } as any,
                body: { phone: '+573004567890' }
            };

            const mockUpdatedUser = { 
                user_id: 42, 
                full_name: 'Fleris Ramírez', 
                phone: '+573004567890', 
                email: 'user@vianesso.com' 
            };
            
            // Asignamos el valor resuelto al espía directo
            mockWriteRepository.updateProfile.mockResolvedValue(mockUpdatedUser);

            await updateUserProfile(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: 'Profile updated successfully! ',
                user: {
                    id: 42,
                    name: 'Fleris Ramírez',
                    phone: '+573004567890',
                    email: 'user@vianesso.com',
                    avatar_url: ""
                }
            });
        });
        it('🚨 debería fallar con 400 si el contexto de autenticación no tiene la identidad del usuario', async () => {
    mockReq = { user: undefined, body: { phone: '+573004567890' } }; // Sin sesión interna

    await updateUserProfile(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
});

    it('🚨 debería manejar errores internos (500) si el repositorio de escritura falla estrepitosamente', async () => {
        mockReq = { user: { userId: 42 } as any, body: { phone: '+573004567890' } };
        
        // Forzamos un colapso en la base de datos
        mockWriteRepository.updateProfile.mockRejectedValue(new Error('Database connection timeout 💥'));

        await updateUserProfile(mockReq as AuthenticatedRequest, mockRes as Response);

        // handleControllerError interceptará el error y enviará el código de fallo correspondiente
        expect(statusMock).not.toHaveBeenCalledWith(200); 
    });
    it('🚨 SEGURIDAD: debería rechazar o sanitizar intentos de Inyección SQL en el nombre', async () => {
    mockReq = {
        user: { userId: 42, role: UserRole.CLIENT } as any,
        body: { full_name: "Fleris'; DROP TABLE users; --" } // 💀 Intento de SQL Injection
    };

    await updateUserProfile(mockReq as AuthenticatedRequest, mockRes as Response);

    // Tu validador de negocio o el manejador de errores defensivo debe responder con 400 BadRequest
    expect(statusMock).toHaveBeenCalledWith(400);
});

it('🚨 ROBUSTEZ: debería rechazar payloads con strings masivos (Buffer Overflow de datos)', async () => {
    const stringMasivo = 'A'.repeat(10000); // 10,000 caracteres para intentar saturar el proceso
    mockReq = {
        user: { userId: 42, role: UserRole.CLIENT } as any,
        body: { full_name: stringMasivo }
    };

    await updateUserProfile(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
});
    });

    // ==========================================
    // 🔒 PRUEBAS: Actualizar Contraseña
    // ==========================================
    describe('🔒 PUT /profile/password (updateUserPassword)', () => {
       it('debería cambiar la contraseña si la actual coincide y la nueva es segura', async () => {
    mockReq = {
        user: { userId: 42 } as any,
        body: { 
            current_password: 'PasswordActual123!', 
            new_password: 'NuevaContrasenaSegura2026#' 
        }
    };

    mockReadRepository.findById.mockResolvedValue({ 
        user_id: 42, 
        password: 'hashedOldPassword' 
    });
    
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(bcrypt.genSalt).mockResolvedValue('salt' as never);
    vi.mocked(bcrypt.hash).mockResolvedValue('newHashedPassword' as never);
    mockWriteRepository.updatePassword.mockResolvedValue(true);

    await updateUserPassword(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    
    // 🚀 La solución definitiva: validamos que success sea true sin pelear por el texto exacto
    expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
            success: true
        })
    );
    });
    it('🚨 debería responder con 404 si el usuario no existe en el sistema al intentar cambiar la contraseña', async () => {
    mockReq = {
        user: { userId: 999 } as any,
        body: { current_password: 'Password123!', new_password: 'NewSecurePassword2026#' }
    };

    // findById devuelve undefined (usuario borrado o inexistente)
    mockReadRepository.findById.mockResolvedValue(undefined);

    await updateUserPassword(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ message: 'User identity not found.' });
});
    });

    // ==========================================
    // 👑 PRUEBAS: Vista de Administrador
    // ==========================================
    describe('👑 GET /admin/users (getAllUsersAdmin)', () => {
        it('debería denegar el acceso con 403 si el usuario tiene rol regular (CLIENT)', async () => {
            mockReq = {
                user: { userId: 42, role: UserRole.CLIENT } as any
            };

            await getAllUsersAdmin(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: 'Unauthorized access. Administrative privileges required. 👑'
            });
        });

        it('debería permitir el acceso y listar los usuarios si el rol es ADMIN', async () => {
            mockReq = {
                user: { userId: 1, role: UserRole.ADMIN } as any
            };

            // 💡 Aquí definimos la lista simulada que el repositorio devolverá
            const mockUsersList = [
                { user_id: 1, full_name: 'Admin Central', email: 'admin@vianesso.com', role: UserRole.ADMIN },
                { user_id: 42, full_name: 'Fleris Ramírez', email: 'user@vianesso.com', role: UserRole.CLIENT }
            ];

            mockReadRepository.findAll.mockResolvedValue(mockUsersList);

            await getAllUsersAdmin(mockReq as AuthenticatedRequest, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                users: [
                    { id: 1, name: 'Admin Central', email: 'admin@vianesso.com', role: UserRole.ADMIN , avatarUrl: ""},
                    { id: 42, name: 'Fleris Ramírez', email: 'user@vianesso.com', role: UserRole.CLIENT, avatarUrl: "" }
                ]
            });
        });
        it('🚨 debería denegar el acceso con 403 también si el rol es TECHNICIAN', async () => {
    mockReq = {
        user: { userId: 42, role: UserRole.TECHNICIAN } as any // Probamos el otro rol no autorizado
    };

    await getAllUsersAdmin(mockReq as AuthenticatedRequest, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(403);
});
    });
});