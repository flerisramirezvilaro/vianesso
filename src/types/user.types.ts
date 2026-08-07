import { UserRole } from ".";


export interface UserDocument {
    user_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    created_at?: Date;
    avatar_url?:string
}
export interface UserAuthDocument extends UserDocument {
    password?: string; 
}

export interface UpdateUserProfileInput {
    full_name?: string;
    phone?: string | null;
    current_password?: string;
    new_password?: string;
    email?: string;
    avatar_url?:string
}


export interface UpdatePasswordInput {
    current_password: string;
    new_password: string;
}