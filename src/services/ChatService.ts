import pool from "../config/db.js";

import { ChatRepository } from "../repositories/ChatRepository.js";

import { UnauthorizedError, ValidationError } from "../errors/AppError.js";

import { UserRole } from "../types/index.js";
import { isValidUUID } from "../utils/validators.js";

export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getActiveChannels(userId: string, role: UserRole) {
    const channels = await this.chatRepository.getChannelsByUser(userId, role);

    return {
      success: true,
      count: channels.length,
      channels,
    };
  }

  async getChatMessages(userId: string, role: UserRole, ticketId: string) {
    if (!isValidUUID(ticketId)) {
      throw new ValidationError("A valid UUID ticketId parameter is required.");
    }

    const hasAccess = await this.chatRepository.verifyAccess(
      userId,
      ticketId,
      role,
    );

    if (!hasAccess) {
      throw new UnauthorizedError(
        "Access denied. You do not have permissions to view this chat context.",
      );
    }

    const messages = await this.chatRepository.getMessagesByTicket(ticketId);

    return {
      success: true,
      count: messages.length,
      messages,
    };
  }

  async sendChatMessage(
    userId: string,
    role: UserRole,
    ticketId: string,
    body: {
      message_text: string;
      attachment_url?: string | null;
    },
  ) {
    if (!isValidUUID(ticketId)) {
      throw new ValidationError("A valid UUID ticketId parameter is required.");
    }

    const hasAccess = await this.chatRepository.verifyAccess(
      userId,
      ticketId,
      role,
    );

    if (!hasAccess) {
      throw new UnauthorizedError(
        "Access denied. You cannot send messages to this chat channel.",
      );
    }

    const newMessage = await this.chatRepository.createMessage({
      ticket_id: ticketId,
      sender_id: userId,
      sender_role: role,
      message_text: body.message_text,
      attachment_url: body.attachment_url ?? null,
    });

    return {
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
    };
  }
}

export const chatService = new ChatService(new ChatRepository(pool));
