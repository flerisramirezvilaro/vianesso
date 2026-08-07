
// src/middlewares/authMiddleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, verifyToken } from './authMiddleware.js';
import {  UserRole } from '../types/index.js';
import jwt from 'jsonwebtoken';
// Mockeamos la librería externa jsonwebtoken para controlar sus respuestas
vi.mock('jsonwebtoken', () => {
    class MockTokenExpiredError extends Error {
        constructor() { super('expired'); this.name = 'TokenExpiredError'; }
    }
    MockTokenExpiredError.prototype.name = 'TokenExpiredError';

    class MockJsonWebTokenError extends Error {
        constructor() { super('invalid'); this.name = 'JsonWebTokenError'; }
    }
    MockJsonWebTokenError.prototype.name = 'JsonWebTokenError';

    return {
        default: {
            verify: vi.fn(),
            TokenExpiredError: MockTokenExpiredError,
            JsonWebTokenError: MockJsonWebTokenError
        }
    };
});
describe('verifyToken Middleware', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        vi.restoreAllMocks();
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis()
        };
        nextFunction = vi.fn();
    });

    it('should return 401 if authorization header is completely missing', () => {
        verifyToken(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Access denied. No token provided.'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() and inject user data into request if token is valid', () => {
        const mockPayload = { userId: 1, role: UserRole.CLIENT };
        // Simulamos que jwt.verify resuelve exitosamente el payload esperado
        vi.mocked(jwt.verify).mockReturnValue(mockPayload as any);

        mockRequest.headers = { authorization: 'Bearer valid.jwt.token' };

        verifyToken(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

        // Verificamos que los datos se inyectaron correctamente en la request
        expect(mockRequest.user).toEqual(mockPayload);
        // Verificamos que cedió el paso al siguiente middleware/controlador
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle expired token via handleControllerError responding 401', () => {
        const expiredError = new Error('jwt expired');
        expiredError.name = 'TokenExpiredError';
        vi.mocked(jwt.verify).mockImplementation(() => { throw expiredError; });

        mockRequest.headers = { authorization: 'Bearer expired.jwt.token' };

        verifyToken(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Your session has expired. Please log in again.'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle invalid/corrupt token via handleControllerError responding 401', () => {
        const invalidError = new Error('invalid signature');
        invalidError.name = 'JsonWebTokenError';
        vi.mocked(jwt.verify).mockImplementation(() => { throw invalidError; });

        mockRequest.headers = { authorization: 'Bearer corrupt.jwt.token' };

        verifyToken(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Invalid token integrity check failed. 🚫'
        });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});