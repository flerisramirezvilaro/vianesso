import {
  ChatChannelDTO,
  ChatMessageDTO,
  CreateChatMessageInput,
} from "../types/chat.types.js";
import { UserRole } from "../types/index.js";

export interface IChatRepository {
  createMessage(data: CreateChatMessageInput): Promise<ChatMessageDTO>;

  getMessagesByTicket(ticketId: string): Promise<ChatMessageDTO[]>;

  verifyAccess(
    userId: string,
    ticketId: string,
    role: UserRole,
  ): Promise<boolean>;

  getChannelsByUser(userId: string, role: UserRole): Promise<ChatChannelDTO[]>;
}
