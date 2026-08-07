// src/services/socketService.ts
import { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { ChatRepository } from '../repositories/ChatRepository.js';
import { socketAuthMiddleware } from '../middlewares/socketAuthMiddleware.js'; // Tu nuevo middleware

import { isValidUUID } from '../utils/validators.js';
import pool from '../config/db.js';
import { AuthenticatedSocket } from '../types/index.js';

const chatRepository = new ChatRepository(pool);

export const initializeSocket = (httpServer: HttpServer): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST']
        }
    });

    // 🔒 Aplicamos el middleware de autenticación estricto
    io.use(socketAuthMiddleware);

    io.on('connection', (socket: AuthenticatedSocket) => {
        // En este punto, socket.user está garantizado por el middleware
        const user = socket.user!; 
        console.log(`🔌 Cliente conectado: ID de Socket: ${socket.id} | User ID: ${user.userId} (${user.role})`);

        /**
         * Evento: Unirse a la sala de chat de un Ticket específico
         * ¡Ya no requerimos que el cliente nos envíe userId ni role por parámetro! 🛡️
         */
        socket.on('join_ticket', async (data: { ticketId: string }) => {
            try {
                const { ticketId } = data;

                if (!ticketId || !isValidUUID(ticketId)) {
                    socket.emit('error', { message: 'Invalid ticket UUID format.' });
                    return;
                }

                // Validamos acceso usando los datos seguros del token
                const hasAccess = await chatRepository.verifyAccess(user.userId, ticketId, user.role);
                if (!hasAccess) {
                    socket.emit('error', { message: 'Unauthorized access to this ticket chat.' });
                    return;
                }

                socket.join(ticketId);
                console.log(`👤 Usuario ${user.userId} (${user.role}) se unió de forma segura al canal: ${ticketId}`);
            } catch (error) {
                console.error('❌ Error en join_ticket:', error);
                socket.emit('error', { message: 'Internal server error joining room.' });
            }
        });

        /**
         * Evento: Envío de mensaje en tiempo real
         * Extraemos emisor y rol directo del socket autenticado 🛡️
         */
        socket.on('send_message', async (data: {
            ticketId: string;
            messageText?: string;
            attachmentUrl?: string;
        }) => {
            try {
                const { ticketId, messageText, attachmentUrl } = data;

                // Verificamos que esté dentro de la sala o tenga acceso legítimo antes de insertar
                const hasAccess = await chatRepository.verifyAccess(user.userId, ticketId, user.role);
                if (!hasAccess) {
                    socket.emit('error', { message: 'Access denied. You cannot write to this channel.' });
                    return;
                }

                // Guardamos el mensaje en la base de datos usando el ID seguro de sesión
                const savedMessage = await chatRepository.createMessage({
                    ticket_id: ticketId,
                    sender_id: user.userId,
                    sender_role: user.role,
                    message_text: messageText,
                    attachment_url: attachmentUrl
                });

                // Emitimos a la sala del ticket
                io.to(ticketId).emit('receive_message', savedMessage);

            } catch (error) {
                console.error('❌ Error al procesar mensaje entrante:', error);
                socket.emit('error', { message: (error as Error).message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Cliente desconectado: ${socket.id}`);
        });
    });

    return io;
};