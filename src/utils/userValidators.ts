
import { ValidationError } from '../errors/AppError.js';
import { UpdateUserProfileInput, UpdatePasswordInput } from '../types/user.types.js';

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;


function validateName(full_name: unknown): string {
    const nameStr = typeof full_name === 'string' ? full_name.trim() : '';
    if (typeof full_name !== 'string' || nameStr.length < 2 || nameStr.length > 100 || !nameRegex.test(nameStr)) {
        throw new ValidationError('The full name must be a valid text between 2 and 100 characters and contain no special characters.');
    }
    return nameStr;
}

function validatePhone(phone: unknown): string | null {
    if (phone === null) return null;
    const phoneStr = typeof phone === 'string' ? phone.trim() : '';
    if (typeof phone !== 'string' || phoneStr.length < 6 || phoneStr.length > 20) {
        throw new ValidationError('The phone number must be a valid text string between 6 and 20 characters.');
    }
    return phoneStr;
}

function validateEmail(email: unknown): string {
    const emailStr = typeof email === 'string' ? email.trim().toLowerCase() : '';
    
    if (typeof email !== 'string' || emailStr.length > 150 || !emailRegex.test(emailStr)) {
        throw new ValidationError('The email address must be a valid electronic mail format.');
    }
    
    return emailStr;
}

export class UserValidator {
    /**
     * 📝 Valida de forma parcial el formulario de Información General
     * 🚀 Complejidad Cognitiva reducida drásticamente de 18 a 3
     */
    static validateUpdateProfile(body: Record<string, unknown>): Partial<UpdateUserProfileInput> {
        const validators: Record<string, (val: any) => any> = {
        full_name: (val) => validateName(val),
        phone: (val) => validatePhone(val),
        email: (val) => validateEmail(val),
        avatar_url: (val) => String(val).trim()
    };
        const payload = Object.keys(body).reduce<Partial<UpdateUserProfileInput>>((acc, key) => {
            if (body[key] !== undefined && key in validators) {
                acc[key as keyof UpdateUserProfileInput] = validators[key](body[key]);
            }
            return acc;
        }, {});
        if (Object.keys(payload).length === 0) {
         throw new ValidationError('At least one field (full_name, phone, email, or avatar) must be provided for update.');
        }
        return payload;
    }

    static validateUpdatePassword(body: Record<string, unknown>): UpdatePasswordInput {
        const { current_password, new_password } = body;

        if (typeof current_password !== 'string' || current_password.length === 0 || current_password.length > 128) {
            throw new ValidationError('The current password is required and must be valid.');
        }

        if (typeof new_password !== 'string' || new_password.length < 8 || new_password.length > 128 || !passwordRegex.test(new_password)) {
            throw new ValidationError(
                'The new password must be between 8 and 128 characters long and include uppercase letters, numbers, and a special symbol. 🔒'
            );
        }

        if (current_password === new_password) {
            throw new ValidationError('The new password cannot be identical to the current password.');
        }

        return { current_password, new_password };
    }
}