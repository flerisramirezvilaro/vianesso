import { query } from "../config/db";
import { UserAuthDocument, UserDocument } from "../types/user.types";
import { IUserReadRepository } from "./IUserRepository";
import { USER_QUERIES } from "./queries/userQueries";

export class PostgresUserReadRepository implements IUserReadRepository {
  async findById(userId: string): Promise<UserAuthDocument | null> {
    const result = await query<UserAuthDocument>(USER_QUERIES.FIND_BY_ID, [
      userId,
    ]);

    return result.rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserAuthDocument | null> {
    const result = await query<UserAuthDocument>(USER_QUERIES.FIND_BY_EMAIL, [
      email,
    ]);

    return result.rows[0] ?? null;
  }

  async findAll(): Promise<UserDocument[]> {
    const result = await query<UserDocument>(USER_QUERIES.FIND_ALL);

    return result.rows;
  }
  async findAuthById(userId: string): Promise<UserAuthDocument | null> {
    const result = await query<UserAuthDocument>(USER_QUERIES.FIND_AUTH_BY_ID, [
      userId,
    ]);

    return result.rows[0] ?? null;
  }
}
