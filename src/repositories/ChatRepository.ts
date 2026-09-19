import { Pool } from "pg";

import { IChatRepository } from "./IChatRepository.js";
import { CHAT_QUERIES } from "./queries/chatQueries.js";

import {
  ChatChannelDTO,
  ChatMessageDTO,
  CreateChatMessageInput,
} from "../types/chat.types.js";

import { UserRole } from "../types/index.js";

export class ChatRepository implements IChatRepository {
  constructor(private readonly db: Pool) {}

  public async createMessage(
    data: CreateChatMessageInput,
  ): Promise<ChatMessageDTO> {
    const values = [
      data.ticket_id,
      data.sender_id,
      data.sender_role,
      data.message_text?.trim() ?? null,
      data.attachment_url?.trim() ?? null,
    ];

    const { rows } = await this.db.query<ChatMessageDTO>(
      CHAT_QUERIES.CREATE_MESSAGE,
      values,
    );

    if (rows.length === 0) {
      throw new Error("Chat message creation returned no data.");
    }

    return rows[0];
  }

  public async getMessagesByTicket(
    ticketId: string,
  ): Promise<ChatMessageDTO[]> {
    const { rows } = await this.db.query<ChatMessageDTO>(
      CHAT_QUERIES.FIND_MESSAGES_BY_TICKET,
      [ticketId],
    );

    return rows;
  }

  public async verifyAccess(
    userId: string,
    ticketId: string,
    role: UserRole,
  ): Promise<boolean> {
    if (role === UserRole.ADMIN) {
      return true;
    }

    const { rows } = await this.db.query<{
      client_id: string;
      technician_id: string | null;
    }>(CHAT_QUERIES.VERIFY_TICKET_ACCESS, [ticketId]);

    const ticket = rows[0];

    if (!ticket) {
      return false;
    }

    return ticket.client_id === userId || ticket.technician_id === userId;
  }

  public async getChannelsByUser(
    userId: string,
    role: UserRole,
  ): Promise<ChatChannelDTO[]> {
    let roleFilter = "";

    const params: string[] = [];

    if (role === UserRole.CLIENT) {
      roleFilter = "WHERE sr.client_id = $1";

      params.push(userId);
    }

    if (role === UserRole.TECHNICIAN) {
      roleFilter = "WHERE sr.technician_id = $1";

      params.push(userId);
    }

    const queryWithFilter = CHAT_QUERIES.FIND_CHANNELS_BY_USER.replace(
      "{{roleFilter}}",
      roleFilter,
    );

    const { rows } = await this.db.query<ChatChannelDTO>(
      queryWithFilter,
      params,
    );

    return rows;
  }
}
