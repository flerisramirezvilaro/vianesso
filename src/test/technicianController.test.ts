// src/test/technicianController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { acceptServiceRequest } from '../controllers/technicianController'; 
import { UnauthorizedError, NotFoundError, ConflictError } from '../errors/AppError.js'; 

// --- 1. HOISTING SEGURO CON VI.HOISTED ---
const { mocks } = vi.hoisted(() => ({
    mocks: {
        assignTechnician: vi.fn()
    }
}));

// Mock del repositorio con la ruta EXACTA que usa tu controlador (incluyendo el .js)
vi.mock('../repositories/ServiceRequestRepository.js', () => {
    return {
        ServiceRequestRepository: class {
            assignTechnician = mocks.assignTechnician;
        }
    };
});

// --- 2. CONFIGURACIÓN DE EXPRESS MOCKS ---
const mockResJson = vi.fn();
const mockResStatus = vi.fn().mockImplementation(() => ({ json: mockResJson }));
const mockNext: NextFunction = vi.fn();

const createMockResponse = (): Response => ({
    status: mockResStatus
} as unknown as Response);

const createMockRequest = (params: any = {}, userSession: any = {}): Request => ({
    params,
    user: userSession 
} as unknown as Request);

// --- 3. SUITE DE PRUEBAS ---
describe('technicianController Unit Tests - viaNesso', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResStatus.mockReturnValue({ json: mockResJson });
    });

    describe('acceptServiceRequest', () => {
        const validRequestId = '440e40c9-d4de-43ac-a84a-b15cfb60c75d';
        const validTechnicianSession = { userId: 8, role: 'TECHNICIAN' };

        it('should accept and assign the service request successfully with 200', async () => {
            const req = createMockRequest({ id: validRequestId }, validTechnicianSession);
            const res = createMockResponse();

            const mockUpdatedRequest = {
                request_id: validRequestId,
                status: 'IN_PROGRESS',
                technician_id: 8
            };

            mocks.assignTechnician.mockResolvedValue(mockUpdatedRequest);

            await acceptServiceRequest(req, res, mockNext);

            expect(mocks.assignTechnician).toHaveBeenCalledWith(validRequestId, 8);
            expect(mockResStatus).toHaveBeenCalledWith(200);
            expect(mockResJson).toHaveBeenCalledWith({
                success: true,
                message: 'Service request successfully accepted and assigned.',
                data: mockUpdatedRequest
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should pass UnauthorizedError to next() if the session technicianId is missing or invalid', async () => {
            const req = createMockRequest({ id: validRequestId }, { userId: 'ID_INVALIDO', role: 'TECHNICIAN' });
            const res = createMockResponse();

            await acceptServiceRequest(req, res, mockNext);

            expect(mocks.assignTechnician).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
            
            const errorPassed = (mockNext as any).mock.calls[0][0];
            expect(errorPassed.message).toBe('Session integrity compromised. Valid technician ID required.');
        });

        it('should pass NotFoundError to next() if requestId is missing or invalid', async () => {
            const req = createMockRequest({ id: undefined }, validTechnicianSession);
            const res = createMockResponse();

            await acceptServiceRequest(req, res, mockNext);

            expect(mocks.assignTechnician).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
            
            const errorPassed = (mockNext as any).mock.calls[0][0];
            expect(errorPassed.message).toBe('Request ID is required to accept a service.');
        });

        it('should pass ConflictError to next() if repository fails to assign (request already taken or nonexistent)', async () => {
            const req = createMockRequest({ id: validRequestId }, validTechnicianSession);
            const res = createMockResponse();

            // Simulamos que el repositorio devuelve null al no poder actualizar filas
            mocks.assignTechnician.mockResolvedValue(null);

            await acceptServiceRequest(req, res, mockNext);

            expect(mocks.assignTechnician).toHaveBeenCalledWith(validRequestId, 8);
            expect(mockNext).toHaveBeenCalledWith(expect.any(ConflictError));
            
            const errorPassed = (mockNext as any).mock.calls[0][0];
            expect(errorPassed.message).toContain('Could not accept the request');
        });
    });
});