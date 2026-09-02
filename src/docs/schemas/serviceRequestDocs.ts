export const serviceRequestSchemas = {
    ServiceRequest: {
        type: 'object',
        description: 'Estructura de la información de una solicitud de servicio expuesta al Frontend.',
        properties: {
            request_id: { type: 'string', format: 'uuid', example: '440e40c9-d4de-43ac-a84a-b15cfb60c75d' },
            client_id: { type: 'string', format: 'uuid', example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f' },
            title: { type: 'string', example: 'Reparación de tubería principal' },
            category: { type: 'string', example: 'Plomería' },
            description: { type: 'string', example: 'Se presenta una fuga masiva de agua potable en el contador de la entrada principal.' },
            address: { type: 'string', example: 'Calle 72 # 46-23, Barrio El Prado' },
            status: { type: 'string', example: 'PENDING' },
            created_at: { type: 'string', format: 'date-time', example: '2026-06-29T04:04:59.715Z' }
        }
    },
    ClientMetrics: {
        type: 'object',
        description: 'Métricas agregadas para el dashboard general del cliente.',
        properties: {
            active_services: { type: 'integer', example: 2 },
            completed_tasks: { type: 'integer', example: 14 },
            pending_reviews: { type: 'integer', example: 1 }
        }
    }
};