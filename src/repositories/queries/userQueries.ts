export const USER_QUERIES = {
    FIND_BY_ID: `
        SELECT user_id, full_name, email, phone, role, password, created_at 
        FROM users 
        WHERE user_id = $1::uuid;
    `,
    FIND_BY_EMAIL: `
        SELECT user_id, full_name, email, password, phone, role 
        FROM users 
        WHERE email = $1;
    `,
    CREATE_USER: `
        INSERT INTO users (full_name, email, password, phone, role) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING user_id, full_name, email, role, created_at;
    `,
    FIND_ALL: `
        SELECT user_id, full_name, email, phone, role, avatar_url, created_at 
        FROM users 
        ORDER BY created_at DESC;
    `,
    UPDATE_PROFILE: `
        UPDATE users 
        SET 
            full_name = COALESCE($1, full_name), 
            phone = COALESCE($2, phone),
            avatar_url = COALESCE($3, avatar_url)
        WHERE user_id = $4::uuid 
        RETURNING user_id, full_name, email, phone, role, avatar_url;
    `,
    UPDATE_PASSWORD: `
        UPDATE users 
        SET password = $1 
        WHERE user_id = $2::uuid;
    `
};