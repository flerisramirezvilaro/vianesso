import { commonErrors, successResponse } from '../utils/swaggerHelpers.js';

export const serviceRequestPaths = {
    '/api/service-requests/dashboard-metrics': {
        get: {
            summary: 'Obtener métricas para el dashboard del cliente',
            description: 'Recupera el conteo de servicios activos, tareas completadas y revisiones pendientes del cliente autenticado.',
            tags: ['Service Requests'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: successResponse('Métricas del dashboard recuperadas exitosamente.', {
                    data: {
                        type: 'object',
                        properties: {
                            active_services: { type: 'integer', example: 2 },
                            completed_tasks: { type: 'integer', example: 14 },
                            pending_reviews: { type: 'integer', example: 1 }
                        }
                    }
                }),
                401: commonErrors.unauthorized,
                500: commonErrors.internalServerError
            }
        }
    },
    '/api/service-requests': {
        post: {
            summary: 'Crear una nueva solicitud de servicio',
            description: 'Registra una nueva solicitud técnica en el sistema vinculada al cliente autenticado. Todos los campos son obligatorios.',
            tags: ['Service Requests'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            required: ['title', 'category', 'description', 'address', 'latitude', 'longitude'],
                            properties: {
                                title: { type: 'string', example: 'Reparación de tubería principal', description: 'Mínimo 10 caracteres' },
                                category: { type: 'string', example: 'Plomería' },
                                description: { type: 'string', example: 'Se presenta una fuga masiva de agua potable en el contador de la entrada principal.' },
                                address: { type: 'string', example: 'Calle 72 # 46-23, Barrio El Prado' },
                                latitude: { type: 'number', example: 10.9934, description: 'Coordenada numérica Y' },
                                longitude: { type: 'number', example: -74.8012, description: 'Coordenada numérica X' },
                                evidence: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary'
                                    },
                                    description: 'Colección de archivos de imagen (máximo 5) para soportar el reporte técnico.'
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                201: successResponse('Solicitud creada exitosamente.', {
                    data: { $ref: '#/components/schemas/ServiceRequest' }
                }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized
            }
        }
    },
    '/api/service-requests/my-requests': {
        get: {
            summary: 'Obtener historial de solicitudes del cliente',
            description: 'Recupera todas las solicitudes creadas por el cliente autenticado extraído del token, ordenadas en reversa cronológica.',
            tags: ['Service Requests'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: successResponse('Historial de solicitudes recuperado exitosamente.', {
                    data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ServiceRequest' }
                    }
                }),
                401: commonErrors.unauthorized
            }
        }
    },
    '/api/service-requests/{request_id}': {
        get: {
            summary: 'Obtener detalle de una solicitud con técnico',
            description: 'Recupera la información completa de una solicitud específica por su ID, incluyendo el perfil del técnico especialista que la ha aceptado.',
            tags: ['Service Requests'],
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'request_id',
                    required: true,
                    schema: { type: 'string', format: 'uuid' },
                    description: 'Identificador único UUID de la solicitud de servicio'
                }
            ],
            responses: {
                200: successResponse('Detalle de la solicitud recuperado exitosamente.', {
                    data: {
                        type: 'object',
                        properties: {
                            request_id: { type: 'string', format: 'uuid', example: '9646c369-bb1a-4ae8-9c95-16e9f3086676' },
                            status: { type: 'string', example: 'PENDING' },
                            category: { type: 'string', example: 'Plomería' },
                            reported_at: { type: 'string', format: 'date-time', example: '2026-07-10T01:46:58.827Z' },
                            address: { type: 'string', example: 'Calle 72 # 46-23, Barrio El Prado' },
                            description: { type: 'string', example: 'Se presenta una fuga masiva de agua potable en el contador.' },
                            evidence_urls: {
                                type: 'array',
                                items: { type: 'string' },
                                example: ['https://res.cloudinary.com/.../img1.png']
                            },
                            assigned_technician: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                    id: { type: 'string', format: 'uuid', example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f' },
                                    name: { type: 'string', example: 'Carlos Mendoza' },
                                    role: { type: 'string', example: 'TECHNICIAN' },
                                    avatar_url: { type: 'string', example: 'https://res.cloudinary.com/.../avatar.png', description: 'URL de la imagen o string vacío si no tiene' }
                                }
                            }
                        }
                    }
                }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized,
                500: commonErrors.internalServerError 
            }
        }
    }
};