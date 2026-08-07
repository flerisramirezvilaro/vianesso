export const CHAT_QUERIES = {
    CREATE_MESSAGE: `
        INSERT INTO public.chat_messages (
            ticket_id, sender_id, sender_role, message_text, attachment_url
        )
        VALUES (
            $1::uuid, $2::uuid, $3, $4, $5
        )
        RETURNING 
            message_id AS id, 
            ticket_id AS "ticketId", 
            sender_id AS "senderId", 
            sender_role AS "senderRole", 
            message_text AS "messageText", 
            attachment_url AS "attachmentUrl", 
            created_at AS "createdAt", 
            is_read AS "isRead";
    `,

    FIND_MESSAGES_BY_TICKET: `
        SELECT 
            cm.message_id AS id,
            cm.ticket_id AS "ticketId",
            cm.sender_id AS "senderId",
            cm.sender_role AS "senderRole",
            cm.message_text AS "messageText",
            cm.attachment_url AS "attachmentUrl",
            cm.created_at AS "createdAt",
            cm.is_read AS "isRead",
            u.full_name AS "senderName",
            u.avatar_url AS "senderAvatar"
        FROM public.chat_messages cm
        INNER JOIN public.users u ON cm.sender_id = u.user_id
        WHERE cm.ticket_id = $1::uuid
        ORDER BY cm.created_at ASC;
    `,

    VERIFY_TICKET_ACCESS: `
        SELECT client_id, technician_id 
        FROM public.tickets 
        WHERE id = $1::uuid;
    `,

    FIND_CHANNELS_BY_USER: `
        SELECT 
            sr.request_id AS "ticketId",
            sr.title AS "ticketTitle",
            sr.status AS "ticketStatus",
            u_client.full_name AS "clientName",
            u_tech.full_name AS "technicianName",
            u_tech.avatar_url AS "technicianAvatar",
            (
                SELECT message_text 
                FROM public.chat_messages 
                WHERE ticket_id = sr.request_id 
                ORDER BY created_at DESC LIMIT 1
            ) AS "lastMessage",
            (
                SELECT created_at 
                FROM public.chat_messages 
                WHERE ticket_id = sr.request_id 
                ORDER BY created_at DESC LIMIT 1
            ) AS "lastMessageTime"
        FROM public.service_requests sr
        LEFT JOIN public.users u_client ON sr.client_id = u_client.user_id
        LEFT JOIN public.users u_tech ON sr.technician_id = u_tech.user_id
        {{roleFilter}}
        ORDER BY "lastMessageTime" DESC NULLS LAST;
    `
};