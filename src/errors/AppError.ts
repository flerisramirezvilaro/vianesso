export abstract class AppError extends Error {
    abstract readonly statusCode: number;

    constructor(message: string) {
        super(message);
        // Restaurar el prototipo nativo de JS
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationError extends AppError {
    readonly statusCode = 400;
}

export class UnauthorizedError extends AppError {
    readonly statusCode = 401;
}

export class NotFoundError extends AppError {
    readonly statusCode = 404;
}

export class ConflictError extends AppError {
    readonly statusCode = 409;
}