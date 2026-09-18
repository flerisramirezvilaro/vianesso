import { query } from '../config/db'
import { CreateUserInput, UserData } from '../types/auth.types'
import {
  UpdateUserProfileInput,
  UserDocument,
} from '../types/user.types'
import { IUserWriteRepository } from './IUserRepository'
import { USER_QUERIES } from './queries/userQueries'

export class PostgresUserWriteRepository
  implements IUserWriteRepository
{
  async create(
    user: CreateUserInput
  ): Promise<UserData> {
    const result = await query<UserData>(
      USER_QUERIES.CREATE_USER,
      [
        user.full_name,
        user.email,
        user.passwordHash,
        user.phone,
        user.role,
      ],
    )

    if (!result.rows[0]) {
      throw new Error(
        'User creation failed. No user was returned by the database.',
      )
    }

    return result.rows[0]
  }

  async updateProfile(
    userId: string,
    data: Partial<UpdateUserProfileInput>,
  ): Promise<UserDocument> {
    const result = await query<UserDocument>(
      USER_QUERIES.UPDATE_PROFILE,
      [
        data.full_name,
        data.phone,
        data.avatar_url ?? null,
        userId,
      ],
    )

    if (!result.rows[0]) {
      throw new Error(
        'Profile update failed. No user was returned by the database.',
      )
    }

    return result.rows[0]
  }

  async updatePassword(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await query(
      USER_QUERIES.UPDATE_PASSWORD,
      [passwordHash, userId],
    )

    return (result.rowCount ?? 0) > 0
  }
}