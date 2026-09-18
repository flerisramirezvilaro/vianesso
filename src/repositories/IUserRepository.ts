
import { CreateUserInput, UserData } from '../types/auth.types.js';
import { UpdateUserProfileInput, UserAuthDocument, UserDocument } from '../types/user.types.js';
export interface IUserReadRepository {
    findById(userId: string): Promise<UserAuthDocument | null>;
    findByEmail(email: string): Promise<UserAuthDocument | null>;
    findAll(): Promise<UserDocument[]>;
}

export interface IUserWriteRepository {
    create(user:CreateUserInput): Promise<UserData>;
    updateProfile(userId: string, data: Partial<UpdateUserProfileInput>): Promise<UserDocument>;
    updatePassword(userId: string, passwordHash: string): Promise<boolean>;
}