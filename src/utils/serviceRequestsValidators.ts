import { ValidationError } from '../errors/AppError.js';
import { CreateServiceRequestInput } from '../types/service.request.repository.js';


const titleRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s.\-#]+$/;

function validateRequiredString(value: unknown, min: number, max: number, fieldName: string): string {
    if (typeof value !== 'string') {
        throw new ValidationError(`The field '${fieldName}' is required and must be a text string.`);
    }
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
        throw new ValidationError(`The field '${fieldName}' must be between ${min} and ${max} characters.`);
    }
    return trimmed;
}

function validateRequiredCoordinate(value: unknown, min: number, max: number, fieldName: string): number {
    if (typeof value !== 'number' || Number.isNaN(value) || value < min || value > max) {
        throw new ValidationError(`The field '${fieldName}' is required and must be a valid numeric coordinate between ${min} and ${max}.`);
    }
    return value;
}

export class ServiceRequestValidator {
    /**
     *  Regla de búnker: Todos los campos son obligatorios. Estructura inmutable.
     *  Complejidad Cognitiva: 1 (SonarQube compliant)
     */
    static validateCreate(body: Record<string, unknown>): CreateServiceRequestInput {
        if (!body || typeof body !== 'object') {
            throw new ValidationError('Invalid request body structure.');
        }

        const title = validateRequiredString(body.title, 10, 150, 'title');
        if (!titleRegex.test(title)) {
            throw new ValidationError("The 'title' contains invalid special characters.");
        }

        const validatedPayload: CreateServiceRequestInput = {
            title,
            category: validateRequiredString(body.category, 3, 50, 'category'),
            description: validateRequiredString(body.description, 20, 2000, 'description'),
            address: body.address ? validateRequiredString(body.address, 5, 255, 'address') : undefined,
            latitude: validateRequiredCoordinate(body.latitude, -90, 90, 'latitude'),
            longitude: validateRequiredCoordinate(body.longitude, -180, 180, 'longitude')
     };

        if (body.evidence_urls && Array.isArray(body.evidence_urls)) {
            validatedPayload.evidence_urls = body.evidence_urls as string[];
        } else {
            validatedPayload.evidence_urls = []; 
        }

        return validatedPayload;
    }
}