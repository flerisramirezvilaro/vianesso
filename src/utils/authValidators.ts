
import { ValidationError } from '../errors/AppError.js';
import { RegisterInput, LoginInput } from '../types/auth.types.js';
import { UserRole } from '../types/index.js';

export class AuthValidator {
    private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    public static validateRegister(input: Partial<RegisterInput>): RegisterInput {
        if (!input || Object.keys(input).length === 0) {
            throw new ValidationError('Request body cannot be empty.');
        }
        const name = input.name?.trim() || '';
        const email = input.email?.trim().toLowerCase() || '';
        const password = input.password || '';
        const role = input.role;

        //  Lanzamos la clase de error específica
        if (!name || !email || !password || !role) {
            throw new ValidationError('All fields (name, email, password, role) are required.');
        }
        if (!Object.values(UserRole).includes(role as UserRole)) {
            throw new ValidationError('The specified user role is not valid within viaNesso.');
        }
        if (!this.EMAIL_REGEX.test(email)) {
            throw new ValidationError('Invalid email format structure.');
        }

        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters long.');
        }

        return { name, email, password, role, phone: input.phone };
    }

    public static validateLogin(input: Partial<LoginInput>): LoginInput {
        if (!input || Object.keys(input).length === 0) {
            throw new ValidationError('Request body cannot be empty.');
        }
        const email = input.email?.trim().toLowerCase() || '';
        const password = input.password || '';

        if (!email || !password) {
            throw new ValidationError('Email and password are required.');
        }

        if (!this.EMAIL_REGEX.test(email)) {
            throw new ValidationError('Invalid email format structure.');
        }

        return { email, password };
    }
}