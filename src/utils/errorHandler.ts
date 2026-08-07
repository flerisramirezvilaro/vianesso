// src/utils/errorHandler.ts

import { AppError } from '../errors/AppError.js';
import { isValidExpressResponse } from './typeGuards.js';



export const handleControllerError = (res: unknown, error: unknown, contextMessage: string): void => {
    console.error(` [${contextMessage}]:`, error);


    if (!isValidExpressResponse(res)) {
        console.error(' Fatal: errorHandler received an invalid or undefined Express Response object.');
        return;
    }

    if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    if (error instanceof Error) {
        res.status(500).json({ message: error.message || 'Internal server error.' });
        return;
    }

    res.status(500).json({ message: 'Internal server error.' });
};