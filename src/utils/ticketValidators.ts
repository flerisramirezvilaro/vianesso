
import { ValidationError } from '../errors/AppError.js';
import { CreateTicketInput } from '../types/index.js';
import { isValidUUID } from './validators.js';

export class TicketValidator {
    private static sanitize(str: string): string {
        return str.replace(/[<>]/g, '').trim();
    }

    public static validateId(id: string | undefined): string {
        if (!id || !isValidUUID(id)) {
            throw new ValidationError('Invalid UUID ticket identifier format. 🔢');
        }
        return id;
    }

    public static validateCreate(input: Partial<CreateTicketInput> | undefined): CreateTicketInput {
        if (!input || Object.keys(input).length === 0) {
            throw new ValidationError('Request body cannot be empty.');
        }

        const client_name = this.sanitize(input.client_name || '');
        const address = this.sanitize(input.address || '');
        const specific_location = input.specific_location ? this.sanitize(input.specific_location) : undefined;
        const access_notes = input.access_notes ? this.sanitize(input.access_notes) : undefined;

        if (!client_name || !address) {
            throw new ValidationError('client_name and address cannot be empty fields.');
        }

        return { client_name, address, specific_location, access_notes,  };
    }

    public static validateUpdate(input: any) {
        if (!input || Object.keys(input).length === 0) {
            throw new ValidationError('Request body cannot be empty.');
        }

        const specific_location = input.specific_location ? this.sanitize(input.specific_location) : null;
        const access_notes = input.access_notes ? this.sanitize(input.access_notes) : null;

        if (specific_location === '') {
            throw new ValidationError('specific_location cannot be an empty string.');
        }

        return { specific_location, access_notes };
    }
}