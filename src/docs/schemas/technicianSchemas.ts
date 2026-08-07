export const technicianSchemas = {
    TechnicianProfile: {
        type: 'object',
        description: 'Estructura detallada del perfil de un técnico de soporte técnico.',
        properties: {
            userId: { 
                type: 'string', 
                format: 'uuid',
                example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f',
                description: 'Identificador único UUID del usuario en el sistema.'
            },
            fullName: { 
                type: 'string', 
                example: 'Carlos 1' 
            },
            email: { 
                type: 'string', 
                format: 'email', 
                example: 'carlos1@vianesso.com' 
            },
            role: { 
                type: 'string', 
                example: 'technician' 
            },
            avatarUrl: { 
                type: 'string', 
                nullable: true, 
                example: 'https://example.com/avatar-carlos.jpg' 
            },
            isAvailable: { 
                type: 'boolean', 
                example: true,
                description: 'Indica si el técnico se encuentra disponible para aceptar nuevos tickets.'
            }
        }
    },
    AcceptedRequestResponse: {
        type: 'object',
        description: 'Estructura de respuesta exitosa al momento de aceptar y asignarse un ticket.',
        properties: {
            requestId: { 
                type: 'string', 
                format: 'uuid', 
                example: '440e40c9-d4de-43ac-a84a-b15cfb60c75d' 
            },
            status: { 
                type: 'string', 
                example: 'IN_PROGRESS',
                description: 'Nuevo estado de la solicitud tras ser aceptada.'
            },
            technicianId: { 
                type: 'string', 
                format: 'uuid',
                example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f',
                description: 'UUID del técnico que exitosamente tomó el ticket.'
            }
        }
    }
};