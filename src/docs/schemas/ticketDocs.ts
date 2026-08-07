import { TicketStatus } from '../../types/index.js'; 

export const ticketSchemas = {
    TicketStatus: {
        type: 'string',
        enum: Object.values(TicketStatus),
        description: 'Estados posibles en el flujo del ciclo de vida de un ticket de soporte técnico.',
        example: TicketStatus.PENDING_REVIEW
    },
    CompactTicket: {
        type: 'object',
        description: 'Estructura optimizada y formateada en camelCase de un ticket para el cliente en el Frontend.',
        properties: {
            id: { 
                type: 'string', 
                format: 'uuid', 
                example: 'd3b07384-d113-49cd-a5d6-80d0051e123d' 
            },
            code: { 
                type: 'string', 
                example: 'TICK-2026-0042' 
            },
            clientName: { 
                type: 'string', 
                example: 'Fleris Ramírez' 
            },
            address: { 
                type: 'string', 
                example: 'Calle 45 #23-10' 
            },
            specificLocation: { 
                type: 'string', 
                nullable: true, 
                example: 'Apto 402, Bloque B' 
            },
            accessNotes: { 
                type: 'string', 
                nullable: true, 
                example: 'Tocar el timbre fuerte, portón gris.' 
            },
            status: { 
                $ref: '#/components/schemas/TicketStatus' 
            },
            createdAt: { 
                type: 'string', 
                format: 'date-time', 
                example: '2026-06-26T22:34:44Z' 
            },
            // ─── PROPIEDADES ACTUALIZADAS A UUID ───
            clientId: { 
                type: 'string', 
                format: 'uuid',
                example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f', 
                description: 'ID único del usuario cliente asociado al ticket.' 
            },
            technicianId: { 
                type: 'string', 
                format: 'uuid',
                nullable: true, 
                example: '440e40c9-d4de-43ac-a84a-b15cfb60c75d', 
                description: 'ID único del técnico asignado. Puede ser nulo si el ticket no ha sido tomado.' 
            }
        }
    }
};