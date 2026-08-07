
import { UserRole } from './index.js';

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserData {
    user_id: string;
    full_name: string;
    email: string;
    password?: string;
    phone: string | null;
    role: UserRole;
    created_at?: Date;
}