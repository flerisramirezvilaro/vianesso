import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthErrorCode, UserRole } from "../types/index.js";
import { UnauthorizedError } from "../errors/AppError.js";
import { handleControllerError } from "../utils/errorHandler.js";

interface JwtErrorDefinition {
  readonly errorCode: AuthErrorCode;
  readonly message: string;
}

const JWT_EXCEPTION_MAP: Record<string, JwtErrorDefinition> = {
  TokenExpiredError: {
    errorCode: AuthErrorCode.TOKEN_EXPIRED,
    message: "Your session has expired. Please log in again.",
  },

  JsonWebTokenError: {
    errorCode: AuthErrorCode.INVALID_TOKEN,
    message: "Invalid token integrity check failed.",
  },
};

export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
  };
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) {
    const error = new UnauthorizedError("Access denied. No token provided.");

    Object.assign(error, {
      errorType: AuthErrorCode.NO_TOKEN,
    });

    return handleControllerError(res, error, "JWT_MIDDLEWARE_MISSING_TOKEN");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as CustomJwtPayload;

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    const exception = JWT_EXCEPTION_MAP[(error as Error).name];

    if (exception) {
      const authError = new UnauthorizedError(exception.message);

      Object.assign(authError, {
        errorType: exception.errorCode,
      });

      return handleControllerError(
        res,
        authError,
        "JWT_VERIFICATION_MIDDLEWARE",
      );
    }

    const authError = new UnauthorizedError("Authentication failed.");

    Object.assign(authError, {
      errorType: AuthErrorCode.UNAUTHORIZED,
    });

    return handleControllerError(
      res,
      authError,
      "JWT_VERIFICATION_MIDDLEWARE_GENERIC",
    );
  }
};
