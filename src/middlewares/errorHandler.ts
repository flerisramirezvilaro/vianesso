import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';

/**
 * 🛡️ Middleware Global de Manejo de Errores (Búnker de Excepciones)
 * Captura todos los fallos de la aplicación enviados a través de next(error)
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // Aunque no se use en el cuerpo, Express exige el 4to argumento para reconocerlo como Error Handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction 
): void => {
    // 1. Si el error hereda de nuestra clase abstracta AppError, es un fallo controlado
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
        return;
    }

    // 2. Si es un fallo imprevisto de infraestructura (ej: la BD se desconectó, un bug de código, etc.)
    // Lo registramos internamente de forma limpia sin exponer detalles sensibles al cliente
    res.status(500).json({
        success: false,
        message: 'Internal Server Error. Fallo crítico en el servidor.'
    });
};