
import { validate, version } from 'uuid'
/**
 * Valida si un string cumple estrictamente con el formato UUID v4.
 */

export const isValidUUID = (id: string): boolean => {
  return validate(id) && version(id) === 4
}

export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export const AUTH_VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
} as const