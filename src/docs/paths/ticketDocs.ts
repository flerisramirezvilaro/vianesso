import { commonErrors, successResponse, pathParameter } from '../utils/swaggerHelpers.js';

export const ticketPaths = {
    '/tickets': {
        post: {
            summary: 'Crear un nuevo Ticket de Soporte',
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            required: ['client_name', 'address'],
                            properties: {
                                client_name: { type: 'string', example: 'Fleris Ramírez' },
                                address: { type: 'string', example: 'Calle 45 #23-10' },
                                specific_location: { type: 'string', example: 'Apto 402' },
                                access_notes: { type: 'string', example: 'Timbre fuerte.' }
                            }
                        }
                    }
                }
            },
            responses: {
                201: successResponse('Ticket creado con éxito.', {
                    message: { type: 'string', example: '¡Ticket creado con éxito! 🛠️' },
                    ticket: { $ref: '#/components/schemas/CompactTicket' }
                }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized,
                403: commonErrors.forbidden
            }
        },
        get: {
            summary: 'Obtener historial de tickets del cliente',
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            responses: {
                200: successResponse('Listado recuperado con éxito.', {
                    count: { type: 'integer', example: 1 },
                    tickets: { type: 'array', items: { $ref: '#/components/schemas/CompactTicket' } }
                }),
                401: commonErrors.unauthorized,
                403: commonErrors.forbidden
            }
        }
    },
    '/tickets/{id}': {
        get: {
            summary: 'Obtener Detalle de un Ticket',
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: pathParameter('id', 'UUID seguro del ticket'),
            responses: {
                200: successResponse('Detalle recuperado.', { ticket: { $ref: '#/components/schemas/CompactTicket' } }),
                401: commonErrors.unauthorized,
                404: commonErrors.notFound
            }
        },
        put: {
            summary: 'Actualizar un Ticket (PENDING_REVIEW)',
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: pathParameter('id', 'UUID seguro del ticket'),
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                specific_location: { type: 'string', example: 'Modificado' }
                            }
                        }
                    }
                }
            },
            responses: {
                200: successResponse('Ticket modificado.', { ticket: { $ref: '#/components/schemas/CompactTicket' } }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized,
                404: commonErrors.notFound
            }
        },
        delete: {
            summary: 'Eliminar un Ticket (PENDING_REVIEW)',
            tags: ['Tickets'],
            security: [{ bearerAuth: [] }],
            parameters: pathParameter('id', 'UUID seguro del ticket'),
            responses: {
                200: successResponse('Ticket eliminado.', { message: { type: 'string', example: 'Deleted successfully. 🗑️' } }),
                400: commonErrors.badRequest,
                401: commonErrors.unauthorized,
                404: commonErrors.notFound
            }
        }
    }
};