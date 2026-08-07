export const SERVICE_REQUEST_QUERIES = {
    CREATE: `
        INSERT INTO public.service_requests (
            client_id, title, category, description, address, location
        ) 
        VALUES (
            $1::uuid, $2, $3, $4, $5, 
            CASE 
                WHEN $6::numeric IS NOT NULL AND $7::numeric IS NOT NULL 
                THEN ST_SetSRID(ST_MakePoint($6::numeric, $7::numeric), 4326)
                ELSE NULL 
            END
        )
        RETURNING request_id, client_id, title, category, description, address, status, created_at;
    `,
    ADD_EVIDENCE: `
        INSERT INTO public.service_request_evidences (request_id, url)
        VALUES ($1::uuid, $2)
        RETURNING evidence_id, url;
    `,
    FIND_BY_CLIENT_ID: `
        SELECT 
            request_id, 
            client_id, 
            title, 
            category, 
            description, 
            address, 
            status, 
            created_at
        FROM public.service_requests
        WHERE client_id = $1::uuid
        ORDER BY created_at DESC;
    `,
    FIND_DETAIL_BY_ID: `
       SELECT 
        sr.request_id,
        sr.status,
        sr.category,
        sr.created_at AS reported_at, 
        sr.address,
        sr.description,
        -- Subconsulta limpia: transforma las filas de la tabla relacional en un array nativo de texto
        COALESCE(
            (
                SELECT array_agg(url) 
                FROM service_request_evidences 
                WHERE request_id = sr.request_id
            ), 
            ARRAY[]::text[]
        ) AS evidence_urls,
        u.user_id AS technician_id,
        u.full_name AS technician_name,
        u.role AS technician_role,
        u.avatar_url AS technician_avatar 
        FROM service_requests sr
        LEFT JOIN users u ON sr.technician_id = u.user_id 
        WHERE sr.request_id = $1::uuid;
    `,
    ACCEPT_REQUEST: `
    UPDATE public.service_requests
    SET 
        technician_id = $1::uuid,
        status = 'IN_PROGRESS' 
    WHERE request_id = $2::uuid AND status = 'PENDING'
    RETURNING request_id, status, technician_id;
`
};