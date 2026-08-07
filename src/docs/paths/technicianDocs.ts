import { commonErrors, successResponse } from '../utils/swaggerHelpers.js';

export const technicianPaths = {
    '/technician/requests/{id}/accept': {
        put: {
            summary: 'Aceptar Solicitud de Servicio',
            description: 'Permite a un técnico autenticado asignarse una solicitud de servicio pendiente. El ID del técnico se extrae de forma segura a través del JWT.',
            tags: ['Técnicos'],
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: {
                        type: 'string',
                        format: 'uuid',
                        example: '440e40c9-d4de-43ac-a84a-b15cfb60c75d'
                    },
                    description: 'Identificador único (UUID) de la solicitud de servicio.'
                }
            ],
            responses: {
                200: successResponse('Solicitud de servicio aceptada y asignada con éxito.', {
                    request_id: { type: 'string', format: 'uuid', example: '440e40c9-d4de-43ac-a84a-b15cfb60c75d' },
                    status: { type: 'string', example: 'IN_PROGRESS' },
                    technician_id: { type: 'string', format: 'uuid', example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f' }
                }),
                401: commonErrors.unauthorized,
                404: commonErrors.notFound
            }
        }
    }
};