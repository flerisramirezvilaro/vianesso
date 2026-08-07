import { UserRole } from ".";


export interface CreateChatMessageInput {
    ticket_id: string;
    sender_id: string;
    sender_role: UserRole;
    message_text?: string;
    attachment_url?: string | null;
}

export interface ChatMessageDTO {
    id: string;
    ticketId: string;
    senderId: string;
    senderRole: UserRole;
    messageText: string | null;
    attachmentUrl: string | null;
    createdAt: Date;
    isRead: boolean;
    senderName?: string;
    senderAvatar?: string;
}

export interface ChatChannelDTO {
    ticketId: string;
    ticketTitle: string;
    ticketStatus: string;
    clientName: string;
    technicianName: string | null;
    technicianAvatar: string | null;
    lastMessage: string | null;
    lastMessageTime: Date | null;
}