import { query } from "../config/db";
import { UserAuthDocument, UserDocument } from "../types/user.types";
import { IUserReadRepository } from "./IUserRepository";
import { USER_QUERIES } from "./queries/userQueries";

export class PostgresUserReadRepository implements IUserReadRepository {
    
    async findById(userId: string): Promise<UserAuthDocument | null> {
        try {
            const result = await query(USER_QUERIES.FIND_BY_ID, [userId]);
            if (!result?.rows?.[0]) return null;
            return result.rows[0] as UserAuthDocument;
        } catch (error) {
            console.error(` [Database Read Exception] Failed to fetch user ${userId}:`, error);
            throw new Error('Database read operation failed.');
        }
    }

    async findByEmail(email: string): Promise<UserAuthDocument | null> {
        try {
            const result = await query(USER_QUERIES.FIND_BY_EMAIL, [email]);
            if (!result?.rows?.[0]) return null;
            return result.rows[0] as UserAuthDocument;
        } catch (error) {
            console.error(` [Database Read Exception] Failed to fetch user by email:`, error);
            throw new Error('Database read operation failed.');
        }
    }

    async findAll(): Promise<UserDocument[]> {
        try {
            const result = await query(USER_QUERIES.FIND_ALL, []);
            return (result?.rows ?? []) as UserDocument[];
        } catch (error) {
            console.error(' [Database Read Exception] Failed to fetch all users:', error);
            throw new Error('Database read operation failed.');
        }
    }
}