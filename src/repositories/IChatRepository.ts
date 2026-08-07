
import { ChatChannelDTO, ChatMessageDTO, CreateChatMessageInput } from '../types/chat.types.js';
import { UserRole } from '../types/index.js';


export interface IChatRepository {
    createMessage(data: CreateChatMessageInput): Promise<ChatMessageDTO>;
    getMessagesByTicket(ticket_id: string): Promise<ChatMessageDTO[]>;
    verifyAccess(user_id: string, ticket_id: string, role: UserRole): Promise<boolean>;
    getChannelsByUser(user_id: string, role: UserRole): Promise<ChatChannelDTO[]>;
}