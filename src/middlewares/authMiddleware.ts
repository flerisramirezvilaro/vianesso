import { Request, Response, NextFunction} from "express";
import jwt,{JwtPayload} from "jsonwebtoken";
import { AuthErrorCode, UserRole } from "../types";
import {  UnauthorizedError,  } from "../errors/AppError";
import { handleControllerError } from "../utils/errorHandler";
interface JwtErrorDefinition {
    readonly errorCode: AuthErrorCode;
    readonly message: string;
}

const JWT_EXCEPTION_MAP: Record<string, JwtErrorDefinition> = {
    [jwt.TokenExpiredError.prototype.name || 'TokenExpiredError']: {
        errorCode: AuthErrorCode.TOKEN_EXPIRED,
        message: 'Your session has expired. Please log in again.'
    },
    [jwt.JsonWebTokenError.prototype.name || 'JsonWebTokenError']: {
        errorCode: AuthErrorCode.INVALID_TOKEN,
        message: 'Invalid token integrity check failed. 🚫'
    }
};


export interface CustomJwtPayload extends JwtPayload {
    userId: string;
    role: UserRole;
}

export interface AuthenticatedRequest extends Request{
    user?:{
        userId: string;
        role:UserRole;

    }
}




export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req?.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    
   if (!token) {
        const error = new UnauthorizedError('Access denied. No token provided.');
        
        Object.assign(error, { errorType: AuthErrorCode.NO_TOKEN });
        
        return handleControllerError(res, error, 'JWT_MIDDLEWARE_MISSING_TOKEN');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomJwtPayload;
         
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };
          
        return next(); 
    } catch (err: unknown) {
       const nativeError = err as Error;
        const exceptionConfig = JWT_EXCEPTION_MAP[nativeError.name];

        if (exceptionConfig) {
            const authError = new UnauthorizedError(exceptionConfig.message);
            Object.assign(authError, { errorType: exceptionConfig.errorCode });
            return handleControllerError(res, authError, 'JWT_VERIFICATION_MIDDLEWARE');
        }

        const genericError = new UnauthorizedError('Authentication failed.');
        Object.assign(genericError, { errorType: AuthErrorCode.UNAUTHORIZED });
        return handleControllerError(res, genericError, 'JWT_VERIFICATION_MIDDLEWARE_GENERIC');
    }
};

