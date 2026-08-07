
import { CreateChatMessageInput } from '../types/chat.types.js';
import { UserRole } from '../types/index.js';
import { isValidUUID } from './validators.js';


export const validateCreateMessageInput = (data: CreateChatMessageInput): void => {
    if (!data.ticket_id || !isValidUUID(data.ticket_id)) {
        throw new Error('[Validation Error] A valid UUID ticket_id is required.');
    }

    // ─── CAMBIO: Validamos que sender_id sea un string con formato UUID válido ───
    if (!data.sender_id || typeof data.sender_id !== 'string' || !isValidUUID(data.sender_id)) {
        throw new Error('[Validation Error] A valid UUID sender_id is required.');
    }

    if (!Object.values(UserRole).includes(data.sender_role)) {
        throw new Error(`[Validation Error] Invalid sender_role: '${data.sender_role}'.`);
    }

    const cleanText = data.message_text?.trim();
    const cleanAttachment = data.attachment_url?.trim();

    if (!cleanText && !cleanAttachment) {
        throw new Error('[Validation Error] Message must contain either text or an attachment.');
    }
};