import { commonErrors } from '../utils/swaggerHelpers.js';

export const chatPaths = {
    '/chat/messages/{ticketId}': {
        get: {
            summary: 'Obtener Historial de Mensajes',
            description: 'Recupera de forma ordenada todos los mensajes de chat asociados a un ticket específico. Requiere autenticación y verifica que el usuario pertenezca al ticket.',
            tags: ['Chat'],
            parameters: [
                {
                    name: 'ticketId',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'uuid',
                        example: 'a3b89e24-d23c-4122-b5e3-0bfb55f10255'
                    },
                    description: 'Identificador único (UUID) del ticket de soporte.'
                }
            ],
            responses: {
                200: {
                    description: 'Historial de mensajes recuperado con éxito.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', format: 'uuid', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
                                        ticketId: { type: 'string', format: 'uuid', example: 'a3b89e24-d23c-4122-b5e3-0bfb55f10255' },
                                        senderId: { type: 'string', format: 'uuid', example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f' },
                                        senderRole: { type: 'string', example: 'technician' },
                                        senderName: { type: 'string', example: 'Carlos 1' },
                                        senderAvatar: { type: 'string', nullable: true, example: 'https://example.com/avatar.jpg' },
                                        messageText: { type: 'string', example: 'Hola, ya voy en camino al domicilio.' },
                                        attachmentUrl: { type: 'string', nullable: true, example: null },
                                        createdAt: { type: 'string', format: 'date-time', example: '2026-07-13T22:15:00.000Z' },
                                        isRead: { type: 'boolean', example: false }
                                    }
                                }
                            }
                        }
                    }
                },
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized,
                403: commonErrors.forbidden
            }
        }
    },
    '/chat/channels': {
        get: {
            summary: 'Listar Canales de Chat Activos',
            description: 'Obtiene la lista de conversaciones o canales activos a los que tiene acceso el usuario según su rol (Cliente o Técnico), incluyendo detalles del último mensaje enviado.',
            tags: ['Chat'],
            responses: {
                200: {
                    description: 'Lista de canales de chat recuperada con éxito.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        ticketId: { type: 'string', format: 'uuid', example: 'a3b89e24-d23c-4122-b5e3-0bfb55f10255' },
                                        ticketTitle: { type: 'string', example: 'Mantenimiento preventivo de aire acondicionado' },
                                        ticketStatus: { type: 'string', example: 'dispatched' },
                                        clientName: { type: 'string', example: 'Fleris Ramírez' },
                                        technicianName: { type: 'string', example: 'Carlos 1' },
                                        technicianAvatar: { type: 'string', nullable: true, example: null },
                                        lastMessage: { type: 'string', nullable: true, example: 'Hola, ya voy en camino al domicilio.' },
                                        lastMessageTime: { type: 'string', format: 'date-time', nullable: true, example: '2026-07-13T22:15:00.000Z' }
                                    }
                                }
                            }
                        }
                    }
                },
                401: commonErrors.unauthorized
            }
        }
    }
};