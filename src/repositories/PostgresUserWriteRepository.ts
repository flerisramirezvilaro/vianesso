import { query } from "../config/db";
import { UserData } from "../types/auth.types";
import { UpdateUserProfileInput, UserDocument } from "../types/user.types";
import { IUserWriteRepository } from "./IUserRepository";
import { USER_QUERIES } from "./queries/userQueries";


export class PostgresUserWriteRepository implements IUserWriteRepository {
    async create(u: { full_name: string; email: string; passwordHash: string; phone: string | null; role: string }): Promise<UserData> {
        try {
            const values = [u.full_name, u.email, u.passwordHash, u.phone, u.role];
            const result = await query(USER_QUERIES.CREATE_USER, values);

            if (!result?.rows?.[0]) {
                throw new Error('[Database Error] Insert failed to return the new user row.');
            }
            return result.rows[0] as UserData;
        } catch (error) {
            console.error(' [Database Exception] User creation failed:', error);
            throw new Error('Database write operation failed.');
        }
    }
    async updateProfile(userId: string, data: Partial<UpdateUserProfileInput>): Promise<UserDocument> {
        try {
            const result = await query(USER_QUERIES.UPDATE_PROFILE, [
            data.full_name, 
            data.phone, 
            data.avatar_url || null, 
            userId
        ]);
            
            if (!result?.rows?.[0]) {
                throw new Error('Update profile query failed to return updated rows.');
            }
            return result.rows[0] as UserDocument;
        } catch (error) {
            console.error(` [Database Write Exception] Profile update failed for user ${userId}:`, error);
            throw new Error('Database modification failed.');
        }
    }
    async updatePassword(userId: string, passwordHash: string): Promise<boolean> {
        try {
            const result = await query(USER_QUERIES.UPDATE_PASSWORD, [passwordHash, userId]);
            return (result?.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(` [Database Write Exception] Password update failed for user ${userId}:`, error);
            throw new Error('Database modification failed.');
        }
    }
}