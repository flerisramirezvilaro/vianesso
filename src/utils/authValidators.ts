import { AUTH_VALIDATION, EMAIL_REGEX, PASSWORD_REGEX } from './validators';
import { ValidationError } from '../errors/AppError.js'
import { RegisterInput, LoginInput } from '../types/auth.types.js'
import { UserRole } from '../types/index.js'

export class AuthValidator {
  private static readonly EMAIL_REGEX=EMAIL_REGEX;
  private static readonly PASSWORD_REGEX=PASSWORD_REGEX
   

  public static validateRegister(
    input: Partial<RegisterInput>,
  ): RegisterInput {
    if (!input || Object.keys(input).length === 0) {
      throw new ValidationError(
        'Request body cannot be empty.',
      )
    }

    const name = input.name?.trim() ?? ''
    const email =
      input.email?.trim().toLowerCase() ?? ''
    const password = input?.password ?? ''
    const phone = input?.phone?.trim()
    const role = input.role

    if (!name || !email || !password || !role) {
      throw new ValidationError(
        'All fields (name, email, password, role) are required.',
      )
    }

    if (name.length < AUTH_VALIDATION.MIN_NAME_LENGTH || name.length > AUTH_VALIDATION.MAX_NAME_LENGTH) {
      throw new ValidationError(
        'Name must contain between 3 and 100 characters.',
      )
    }

    if (email.length > AUTH_VALIDATION.MAX_EMAIL_LENGTH) {
      throw new ValidationError(
        'Email exceeds the maximum allowed length.',
      )
    }

    if (!Object.values(UserRole).includes(role)) {
      throw new ValidationError(
        'The specified user role is not valid within ViaNesso.',
      )
    }

    if (!this.EMAIL_REGEX.test(email)) {
      throw new ValidationError(
        'Invalid email format structure.',
      )
    }

    if (!this.PASSWORD_REGEX.test(password)) {
      throw new ValidationError(
        'Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number.',
      )
    }

    if (phone && phone.length > AUTH_VALIDATION.MAX_PHONE_LENGTH) {
      throw new ValidationError(
        'Phone number exceeds the maximum allowed length.',
      )
    }

    return {
      name,
      email,
      password,
      role,
      phone,
    }
  }

  public static validateLogin(
    input: Partial<LoginInput>,
  ): LoginInput {
    if (!input || Object.keys(input).length === 0) {
      throw new ValidationError(
        'Request body cannot be empty.',
      )
    }

    const email =
      input.email?.trim().toLowerCase() ?? ''
    const password = input.password ?? ''

    if (!email || !password) {
      throw new ValidationError(
        'Email and password are required.',
      )
    }

    if (email.length > AUTH_VALIDATION.MAX_EMAIL_LENGTH) {
      throw new ValidationError(
        'Email exceeds the maximum allowed length.',
      )
    }

    if (!this.EMAIL_REGEX.test(email)) {
      throw new ValidationError(
        'Invalid email format structure.',
      )
    }

    return {
      email,
      password,
    }
  }
}