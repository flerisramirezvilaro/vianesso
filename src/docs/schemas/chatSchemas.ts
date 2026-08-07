export const chatSchemas = {
    ChatMessage: {
        type: 'object',
        description: 'Representa un mensaje individual dentro del canal de chat de un ticket.',
        properties: {
            id: { 
                type: 'string', 
                format: 'uuid',
                example: 'c9a29e24-f11c-4233-a4e2-1a2b3c4d5e6f',
                description: 'Identificador único UUID del mensaje.'
            },
            ticketId: { 
                type: 'string', 
                format: 'uuid', 
                example: 'a3b89e24-d23c-4122-b5e3-0bfb55f10255',
                description: 'UUID del ticket (o solicitud de servicio) asociado.'
            },
            senderId: { 
                type: 'string', 
                format: 'uuid',
                example: '440e40c9-d4de-43ac-a84a-b15cfb60c75d',
                description: 'UUID del usuario que envió el mensaje.'
            },
            senderRole: { 
                type: 'string', 
                enum: ['client', 'technician', 'admin'],
                example: 'technician',
                description: 'Rol del emisor en el sistema al momento de enviar el mensaje.'
            },
            senderName: { 
                type: 'string', 
                example: 'Carlos 1',
                description: 'Nombre completo del emisor del mensaje.'
            },
            senderAvatar: { 
                type: 'string', 
                nullable: true, 
                example: 'https://example.com/avatar.jpg',
                description: 'URL de la foto de perfil del emisor.'
            },
            messageText: { 
                type: 'string', 
                nullable: true, 
                example: 'Hola, ya voy en camino al domicilio.',
                description: 'Contenido textual del mensaje de chat.'
            },
            attachmentUrl: { 
                type: 'string', 
                nullable: true, 
                example: null,
                description: 'URL de algún archivo o imagen adjunta en el chat.'
            },
            createdAt: { 
                type: 'string', 
                format: 'date-time', 
                example: '2026-07-13T22:15:00.000Z',
                description: 'Fecha de creación del registro del mensaje.'
            },
            isRead: { 
                type: 'boolean', 
                example: false,
                description: 'Indica si el mensaje ha sido leído por el destinatario.'
            }
        }
    },
    ChatChannel: {
        type: 'object',
        description: 'Información resumida de una conversación activa o canal de chat para las bandejas de entrada.',
        properties: {
            ticketId: { 
                type: 'string', 
                format: 'uuid', 
                example: 'a3b89e24-d23c-4122-b5e3-0bfb55f10255' 
            },
            ticketTitle: { 
                type: 'string', 
                example: 'Mantenimiento preventivo de aire acondicionado' 
            },
            ticketStatus: { 
                type: 'string', 
                example: 'dispatched' 
            },
            clientName: { 
                type: 'string', 
                example: 'Fleris Ramírez' 
            },
            technicianName: { 
                type: 'string', 
                example: 'Carlos 1' 
            },
            technicianAvatar: { 
                type: 'string', 
                nullable: true, 
                example: null 
            },
            lastMessage: { 
                type: 'string', 
                nullable: true, 
                example: 'Hola, ya voy en camino al domicilio.' 
            },
            lastMessageTime: { 
                type: 'string', 
                format: 'date-time', 
                nullable: true, 
                example: '2026-07-13T22:15:00.000Z' 
            }
        }
    }
};