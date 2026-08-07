
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { UserRole } from '../types/index.js';
import { ValidationError, UnauthorizedError } from '../errors/AppError.js';
import { handleControllerError } from '../utils/errorHandler.js';
import { ensureSingleString, isValidExpressResponse } from '../utils/typeGuards.js';
import { isValidUUID } from '../utils/validators.js';
import { ChatRepository } from '../repositories/ChatRepository.js';
import pool from '../config/db.js'; // Ajusta la ruta a tu conexión de base de datos

const chatRepository = new ChatRepository(pool);

/**
 * Helper para validar la sesión e integridad del contexto del usuario autenticado
 */
const getAuthenticatedUserContext = (req: AuthenticatedRequest): { userId: string; role: UserRole } => {
    const userId = req?.user?.userId;
    const role = req?.user?.role;

    // ─── CAMBIO: Validamos que userId sea un string y cumpla con el formato UUID ───
    if (typeof userId !== 'string' || !isValidUUID(userId) || !role) {
        throw new ValidationError('Forbidden. Session integrity compromised.');
    }

    return { userId, role: role as UserRole };
};

/**
 * Obtiene todos los canales de chat activos para el usuario autenticado (Client, Technician o Admin)
 */
export const getActiveChannels = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req || !isValidExpressResponse(res)) {
            console.error('  [Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }

        const { userId, role } = getAuthenticatedUserContext(req);
        const channels = await chatRepository.getChannelsByUser(userId, role);

        res.status(200).json({
            success: true,
            count: channels.length,
            channels
        });
    } catch (error) {
        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during fetching active chat channels');
        } else {
            console.error('  [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};

/**
 * Obtiene el historial de mensajes de un ticket específico tras verificar accesos
 */
export const getChatMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req || !isValidExpressResponse(res)) {
            console.error('  [Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }

        const { userId, role } = getAuthenticatedUserContext(req);
        
       
        const ticketId = ensureSingleString(req.params?.ticketId);

        if (!ticketId || !isValidUUID(ticketId)) {
            throw new ValidationError('A valid UUID ticketId parameter is required.');
        }

        // Validación de seguridad...
        const hasAccess = await chatRepository.verifyAccess(userId, ticketId, role);
        if (!hasAccess) {
            throw new UnauthorizedError('Access denied. You do not have permissions to view this chat context.');
        }

        const messages = await chatRepository.getMessagesByTicket(ticketId);

        res.status(200).json({
            success: true,
            count: messages.length,
            messages
        });
    } catch (error) {
        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during fetching chat messages');
        } else {
            console.error('  [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};

/**
 * Registra un nuevo mensaje a través de HTTP (útil para envíos tradicionales o depuraciones)
 */
export const sendChatMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req || !isValidExpressResponse(res)) {
            console.error('  [Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }

        const { userId, role } = getAuthenticatedUserContext(req);

         const ticketId = ensureSingleString(req.params?.ticketId);
        if (!ticketId || !isValidUUID(ticketId)) {
            throw new ValidationError('A valid UUID ticketId parameter is required.');
        }

        const { message_text, attachment_url } = req.body;

        // Validación de seguridad de escritura en canal
        const hasAccess = await chatRepository.verifyAccess(userId, ticketId, role);
        if (!hasAccess) {
            throw new UnauthorizedError('Access denied. You cannot send messages to this chat channel.');
        }

        const newMessage = await chatRepository.createMessage({
            ticket_id: ticketId,
            sender_id: userId,
            sender_role: role,
            message_text,
            attachment_url
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully.',
            data: newMessage
        });
    } catch (error) {
        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during sending chat message');
        } else {
            console.error('  [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};