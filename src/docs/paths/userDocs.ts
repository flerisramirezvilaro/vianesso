import { commonErrors, successResponse } from '../utils/swaggerHelpers.js';

export const userPaths = {
    '/users/profile': {
        get: {
            summary: 'Obtener información del Perfil',
            tags: ['Usuarios'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: successResponse('Datos del perfil recuperados con éxito.', {
                    user: { $ref: '#/components/schemas/UserProfile' }
                }),
                401: commonErrors.unauthorized
            }
        },
        put: {
            summary: 'Actualizar Perfil (Guardar Cambios)',
            description: 'Permite actualizar el nombre, teléfono, email o la foto de perfil usando formato multipart/form-data.',
            tags: ['Usuarios'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                full_name: { type: 'string', example: 'Fleris Ramírez', description: 'Mínimo 2 caracteres' },
                                phone: { type: 'string', nullable: true, example: '+573004567890', description: 'Mínimo 6 caracteres o null' },
                                email: { type: 'string', format: 'email', example: 'fleris@vianesso.com' },
                                avatar: { 
                                    type: 'string', 
                                    format: 'binary', 
                                    description: 'Archivo de imagen para el avatar (JPEG, PNG, etc.)' 
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                200: successResponse('Perfil actualizado con éxito! 📝', {
                    message: { type: 'string', example: 'Profile updated successfully! 📝' },
                    user: { $ref: '#/components/schemas/UserProfile' }
                }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized
            }
        }
    },
    '/users/profile/password': {
        put: {
            summary: 'Actualizar Contraseña',
            tags: ['Usuarios'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['current_password', 'new_password'],
                            properties: {
                                current_password: { type: 'string', format: 'password', example: 'OldPassword123!' },
                                new_password: { type: 'string', format: 'password', example: 'NewSecurePassword2026#' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: successResponse('Contraseña modificada de forma segura.', {
                    message: { type: 'string', example: 'Password updated successfully! 🔒' }
                }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized
            }
        }
    },
    '/users/admin/users': {
        get: {
            summary: 'Listado global de usuarios (Admin)',
            tags: ['Administración'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: successResponse('Listado del registro recuperado exitosamente.', {
                    users: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid', example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f' },
                                name: { type: 'string', example: 'Fleris Ramírez' },
                                email: { type: 'string', example: 'fleris@vianesso.com' },
                                role: { type: 'string', example: 'ADMIN' },
                                avatarUrl: { type: 'string', example: 'https://res.cloudinary.com/.../img.png' }
                            }
                        }
                    }
                }),
                401: commonErrors.unauthorized,
                403: commonErrors.forbidden
            }
        }
    }
};