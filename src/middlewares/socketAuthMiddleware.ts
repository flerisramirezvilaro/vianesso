
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket, UserRole } from '../types/index.js'; 

const JWT_SECRET = process.env.JWT_SECRET || 'tu_jwt_secret_temporal';

interface JwtPayload {
    userId: string;
    role: string;
}

export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
    try {
        // 1. Extraemos el token del handshake (auth o headers)
        let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

        if (!token) {
            return next(new Error('Authentication error: Token is missing.'));
        }

        // Limpiamos el formato "Bearer <token>"
        if (token.startsWith('Bearer ')) {
            token = token.slice(7).trim();
        }

        // 2. Verificamos el token
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // 3. Validamos integridad
        if (!decoded.userId || !decoded.role) {
            return next(new Error('Authentication error: Invalid token payload.'));
        }

        // 4. Inyectamos los datos del usuario en la instancia del socket
        socket.user = {
            userId: decoded.userId,
            role: decoded.role as UserRole
        };

        next();
    } catch (error) {
        console.error('❌ Fallo de autenticación en Handshake de Socket:', (error as Error).message);
        return next(new Error('Authentication error: Session is invalid or has expired.'));
    }
};