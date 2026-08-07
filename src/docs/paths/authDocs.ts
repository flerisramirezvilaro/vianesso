
import { commonErrors, successResponse } from '../utils/swaggerHelpers.js';

export const authPaths = {
    '/auth/login': {
        post: {
            summary: 'Iniciar Sesión (Login)',
            tags: ['Autenticación'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email', 'password'],
                            properties: {
                                email: { type: 'string', format: 'email', example: 'user@vianesso.com' },
                                password: { type: 'string', format: 'password', example: 'securePassword123' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: successResponse('Autenticación exitosa. Devuelve el token JWT de sesión.', {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid', example: 'u1b07384-d113-49cd-a5d6-80d0051e123d' },
                            email: { type: 'string', example: 'user@vianesso.com' },
                            role: { type: 'string', example: 'client' }
                        }
                    }
                }),
                400: commonErrors.badRequest
            }
        }
    },
    '/auth/register': {
        post: {
            summary: 'Registrar un nuevo usuario (Cliente)',
            tags: ['Autenticación'],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['email', 'password', 'name'],
                            properties: {
                                name: { type: 'string', example: 'Fleris Ramírez' },
                                email: { type: 'string', format: 'email', example: 'user@vianesso.com' },
                                password: { type: 'string', format: 'password', example: 'securePassword123' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: successResponse('Usuario registrado con éxito.', {
                    message: { type: 'string', example: 'User registered successfully. 🚀' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid', example: 'u1b07384-d113-49cd-a5d6-80d0051e123d' },
                            name: { type: 'string', example: 'Fleris Ramírez' },
                            email: { type: 'string', example: 'user@vianesso.com' },
                            role: { type: 'string', example: 'client' }
                        }
                    }
                }),
                400: commonErrors.badRequest
            }
        }
    }
};