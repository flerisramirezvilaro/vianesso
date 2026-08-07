export const TICKET_QUERIES = {
    CREATE: `
        INSERT INTO tickets (ticket_code, client_id, client_name, address, specific_location, access_notes, status)
        VALUES ($1, $2::uuid, $3, $4, $5, $6, $7)
        RETURNING id, ticket_code, client_id, client_name, address, status, created_at;
    `,
    FIND_ALL_BY_CLIENT: `
        SELECT id, ticket_code, client_name, address, specific_location, access_notes, status, created_at
        FROM tickets
        WHERE client_id = $1::uuid
        ORDER BY created_at DESC;
    `,
    FIND_BY_ID_AND_CLIENT_WITH_TECH: `
        SELECT 
            t.id, t.ticket_code, t.client_name, t.address, t.specific_location, t.access_notes, t.status, t.created_at,
            u.full_name AS technician_name, u.phone AS technician_phone
        FROM tickets t
        LEFT JOIN users u ON t.technician_id = u.user_id
        WHERE t.id = $1::uuid AND t.client_id = $2::uuid;
    `,
    FIND_STATUS_ONLY: `
        SELECT id, status FROM tickets WHERE id = $1::uuid AND client_id = $2::uuid;
    `,
    UPDATE: `
        UPDATE tickets 
        SET specific_location = $1, access_notes = $2, updated_at = NOW()
        WHERE id = $3::uuid AND client_id = $4::uuid
        RETURNING id, ticket_code, specific_location, access_notes, status;
    `,
    DELETE: `
        DELETE FROM tickets WHERE id = $1::uuid AND client_id = $2::uuid;
    `
};