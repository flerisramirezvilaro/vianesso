import { Pool } from 'pg';
import { IChatRepository } from './IChatRepository.js';

import { isValidUUID } from '../utils/validators.js';
import { validateCreateMessageInput } from '../utils/chatValidators.js';
import { ChatChannelDTO, ChatMessageDTO, CreateChatMessageInput } from '../types/chat.types.js';
import { UserRole } from '../types/index.js';
import { CHAT_QUERIES } from './queries/chatQueries.js';

export class ChatRepository implements IChatRepository {
    constructor(private readonly db: Pool) {}

    /**
     * Inserta un nuevo mensaje en la base de datos previa validación de estructura
     */
    public async createMessage(data: CreateChatMessageInput): Promise<ChatMessageDTO> {
        // Ejecuta la validación limpia desde utils
        validateCreateMessageInput(data);

        const values: [string, string, UserRole, string | null, string | null] = [
            data.ticket_id,
            data.sender_id,
            data.sender_role,
            data.message_text?.trim() || null,
            data.attachment_url?.trim() || null
        ];

        try {
            const { rows } = await this.db.query(CHAT_QUERIES.CREATE_MESSAGE, values);
            
            if (!rows || rows.length === 0) {
                throw new Error('Database insertion succeeded but returned an empty structural payload.');
            }

            return rows[0] as ChatMessageDTO;
        } catch (error) {
            throw new Error(`[Database Core Failure] Failed to create chat message: ${(error as Error).message}`);
        }
    }

    /**
     * Recupera el historial de mensajes de un ticket con validación de UUID reutilizada
     */
    public async getMessagesByTicket(ticket_id: string): Promise<ChatMessageDTO[]> {
        if (!ticket_id || !isValidUUID(ticket_id)) {
            throw new Error('[Validation Error] A valid UUID ticket_id is required to fetch messages.');
        }

        try {
            const { rows } = await this.db.query(CHAT_QUERIES.FIND_MESSAGES_BY_TICKET, [ticket_id]);
            return (rows ?? []) as ChatMessageDTO[];
        } catch (error) {
            throw new Error(`[Database Core Failure] Failed to fetch messages for ticket_id ${ticket_id}: ${(error as Error).message}`);
        }
    }

    /**
     * Valida la seguridad de acceso al chat utilizando type checking estricto y isValidUUID
     */
    public async verifyAccess(user_id: string, ticket_id: string, role: UserRole): Promise<boolean> {
        if (role === UserRole.ADMIN) {
            return true;
        }

        // ─── CAMBIO: Validamos que user_id sea un string con formato UUID válido ───
        if (!user_id || typeof user_id !== 'string' || !isValidUUID(user_id)) {
            throw new Error('[Validation Error] A valid UUID user_id is required.');
        }

        if (!ticket_id || !isValidUUID(ticket_id)) {
            throw new Error('[Validation Error] A valid UUID ticket_id is required.');
        }

        try {
            const { rows } = await this.db.query(CHAT_QUERIES.VERIFY_TICKET_ACCESS, [ticket_id]);

            if (!rows || rows.length === 0) {
                return false;
            }

            // ─── CAMBIO: client_id y technician_id ahora se tipan como string (UUID) ───
            const ticket = rows[0] as { client_id: string; technician_id: string | null };
            return ticket.client_id === user_id || ticket.technician_id === user_id;
        } catch (error) {
            throw new Error(`[Database Core Failure] Failed to verify access for user ${user_id} on ticket ${ticket_id}: ${(error as Error).message}`);
        }
    }

    /**
     * Obtiene los canales activos filtrados y tipados sin dependencias redundantes
     */
    public async getChannelsByUser(user_id: string, role: UserRole): Promise<ChatChannelDTO[]> {
        // ─── CAMBIO: Validamos que user_id sea un string con formato UUID válido ───
        if (!user_id || typeof user_id !== 'string' || !isValidUUID(user_id)) {
            throw new Error('[Validation Error] A valid UUID user_id is required.');
        }

        try {
            let roleFilter = '';
           
            const params: string[] = [];

            if (role === UserRole.CLIENT) {
                roleFilter = 'WHERE sr.client_id = $1';
                params.push(user_id);
            } else if (role === UserRole.TECHNICIAN) {
                roleFilter = 'WHERE sr.technician_id = $1';
                params.push(user_id);
            }

            const queryWithFilter = CHAT_QUERIES.FIND_CHANNELS_BY_USER.replace('{{roleFilter}}', roleFilter);
            const { rows } = await this.db.query(queryWithFilter, params);

            return (rows ?? []) as ChatChannelDTO[];
        } catch (error) {
            throw new Error(`[Database Core Failure] Failed to fetch chat channels for user ${user_id}: ${(error as Error).message}`);
        }
    }
}