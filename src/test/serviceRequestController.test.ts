import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { Request, Response, NextFunction } from 'express';

import { ValidationError, UnauthorizedError, NotFoundError } from '../errors/AppError.js';

// --- 1. HOISTING SEGURO CON VI.HOISTED ---
const { mocks } = vi.hoisted(() => ({
    mocks: {
        create: vi.fn(),
        findByClientId: vi.fn(),
        findDetailById: vi.fn(),
        validateCreate: vi.fn()
    }
}));

// Mock del Validador Estricto
vi.mock('../utils/serviceRequestsValidators.js', () => ({
    ServiceRequestValidator: {
        validateCreate: mocks.validateCreate
    }
}));

// Mock del Pool global de la base de datos por si acaso
vi.mock('../config/database.js', () => ({
    pool: {}
}));

// 🎯 MOCK TOTAL DEL REPOSITORIO
// Exportamos tanto la Clase constructora como el objeto de instancia directa para cubrir cualquier importación
vi.mock('../repositories/ServiceRequestRepository.js', () => {
    const mockInstance = {
        create: mocks.create,
        findByClientId: mocks.findByClientId,
        findDetailById: mocks.findDetailById
    };

    return {
        ServiceRequestRepository: function() { return mockInstance; },
        serviceRequestRepository: mockInstance
    };
});

// --- 2. DECLARACIÓN DE SCOPE SUPERIOR ---
let createRequest: (req: Request, res: Response, next: NextFunction) => Promise<void>;
let getClientRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
let getServiceRequestDetail: (req: Request, res: Response, next: NextFunction) => Promise<void>;

beforeAll(async () => {
    // Importación dinámica tras congelar los mocks en memoria
    const controller = await import('../controllers/serviceRequestController.js');
    createRequest = controller.createRequest;
    getClientRequests = controller.getClientRequests;
    getServiceRequestDetail = controller.getServiceRequestDetail
});

// --- 3. CONFIGURACIÓN DE EXPRESS MOCKS ---
const mockResJson = vi.fn();
const mockResStatus = vi.fn().mockImplementation(() => ({ json: mockResJson }));
const mockNext: NextFunction = vi.fn();

const createMockResponse = (): Response => ({
    status: mockResStatus
} as unknown as Response);

const createMockAuthenticatedRequest = (body: any = {}, userContext: any = { userId: 3 }): Request => ({
    body,
    user: userContext
} as unknown as Request);

// --- 4. SUITE DE PRUEBAS UNITARIAS ---
describe('serviceRequestController Unit Tests - viaNesso', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockResStatus.mockReturnValue({ json: mockResJson });
        
        // Comportamiento base por defecto del validador
        mocks.validateCreate.mockImplementation((input) => input);
    });

    // ==========================================
    // 📝 PRUEBAS PARA: createRequest (POST)
    // ==========================================
    describe('createRequest', () => {
        const validPayload = {
            title: 'Reparación de tubería principal',
            category: 'Plomería',
            description: 'Se presenta una fuga masiva de agua potable en el contador.',
            address: 'Calle 72 # 46-23, Barrio El Prado',
            latitude: 10.9934,
            longitude: -74.8012
        };

        it('[ÉXITO] debe registrar la solicitud con estado 201 si el token y el body están perfectos', async () => {
            const req = createMockAuthenticatedRequest(validPayload, { userId: 3 });
            const res = createMockResponse();

            const mockDbRecord = { request_id: 'uuid-123', client_id: 3, ...validPayload, status: 'PENDING' };
            mocks.create.mockResolvedValue(mockDbRecord);

            await createRequest(req, res, mockNext);

            expect(mocks.validateCreate).toHaveBeenCalledWith(validPayload);
            expect(mocks.create).toHaveBeenCalledWith(3, {
                ...validPayload,
                evidence_urls: []
            });
            expect(mockResStatus).toHaveBeenCalledWith(201);
            expect(mockResJson).toHaveBeenCalledWith({ success: true, data: mockDbRecord });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('[SEGURIDAD] debe lanzar UnauthorizedError si userId es undefined (middleware corrupto)', async () => {
            const req = createMockAuthenticatedRequest(validPayload, { userId: undefined });
            const res = createMockResponse();

            await createRequest(req, res, mockNext);

            expect(mocks.validateCreate).not.toHaveBeenCalled();
            expect(mocks.create).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('[SEGURIDAD] debe lanzar UnauthorizedError si userId viene como un string numérico en vez de number', async () => {
            const req = createMockAuthenticatedRequest(validPayload, { userId: '3' });
            const res = createMockResponse();

            await createRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('[VALIDACIÓN] debe derivar el error a next() si el validador estricto del body rechaza los campos', async () => {
            const req = createMockAuthenticatedRequest({ title: 'Corta' }, { userId: 3 });
            const res = createMockResponse();

            mocks.validateCreate.mockImplementation(() => {
                throw new ValidationError('Validation failed. Fields are missing.');
            });

            await createRequest(req, res, mockNext);

            expect(mocks.create).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
        });

        it('[INFRAESTRUCTURA] debe capturar fallos inesperados de la BD (PostgreSQL caído) y mandarlos a next()', async () => {
            const req = createMockAuthenticatedRequest(validPayload, { userId: 3 });
            const res = createMockResponse();

            mocks.create.mockRejectedValue(new Error('Database connection timeout.'));

            await createRequest(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    // ==========================================
    // 📋 PRUEBAS PARA: getClientRequests (GET)
    // ==========================================
    describe('getClientRequests', () => {
        it('[ÉXITO] debe devolver 200 y el arreglo con el historial cronológico del cliente activo', async () => {
            const req = createMockAuthenticatedRequest({}, { userId: 3 });
            const res = createMockResponse();

            const mockHistory = [
                { request_id: 'uuid-1', client_id: 3, title: 'Fuga de agua', status: 'PENDING' },
                { request_id: 'uuid-2', client_id: 3, title: 'Cortocorticuito', status: 'RESOLVED' }
            ];
            mocks.findByClientId.mockResolvedValue(mockHistory);

            await getClientRequests(req, res, mockNext);

            expect(mocks.findByClientId).toHaveBeenCalledWith(3);
            expect(mockResStatus).toHaveBeenCalledWith(200);
            expect(mockResJson).toHaveBeenCalledWith({ success: true, data: mockHistory });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('[SEGURIDAD] debe lanzar UnauthorizedError si no hay sesión válida al intentar leer el historial', async () => {
            const req = createMockAuthenticatedRequest({}, { userId: NaN });
            const res = createMockResponse();

            await getClientRequests(req, res, mockNext);

            expect(mocks.findByClientId).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });

        it('[INFRAESTRUCTURA] debe desviar el error a next() si el repositorio falla al mapear las filas', async () => {
            const req = createMockAuthenticatedRequest({}, { userId: 3 });
            const res = createMockResponse();

            mocks.findByClientId.mockRejectedValue(new Error('Internal Server Error mapping rows.'));

            await getClientRequests(req, res, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    // ==========================================
    // 🔍 PRUEBAS PARA: getServiceRequestDetail (GET)
    // ==========================================
    describe('getServiceRequestDetail', () => {
        const mockParamId = 'a5c8e312-7104-4b9c-8822-1d5f66345672';

        const createMockRequestWithParams = (params: any = {}, userContext: any = { userId: 3 }): Request => ({
            params,
            user: userContext
        } as unknown as Request);

        it('[ÉXITO] debe devolver 200 y el detalle estructurado de Figma si la solicitud existe', async () => {
            const req = createMockRequestWithParams({ id: mockParamId }, { userId: 3 });
            const res = createMockResponse();

            const mockDetailRecord = {
                request_id: mockParamId,
                status: 'IN_PROGRESS',
                category: 'Mantenimiento Eléctrico',
                reported_at: new Date('2026-06-19T15:14:00.000Z'),
                address: 'Av. North Ridge 214',
                description: 'El disyuntor presenta fallas...',
                assigned_technician: {
                    id: 88,
                    name: 'Carlos Mendoza',
                    role: 'ESPECIALISTA',
                    avatar_url: 'https://vianesso.com/avatars/carlos.jpg'
                }
            };

            mocks.findDetailById.mockResolvedValue(mockDetailRecord);

            await getServiceRequestDetail(req, res, mockNext);

            expect(mocks.findDetailById).toHaveBeenCalledWith(mockParamId);
            expect(mockResStatus).toHaveBeenCalledWith(200);
            expect(mockResJson).toHaveBeenCalledWith({ success: true, data: mockDetailRecord });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('[404 NOT FOUND] debe desviar un NotFoundError a next() si el ID no corresponde a ningún registro', async () => {
            const req = createMockRequestWithParams({ id: '00000000-0000-0000-0000-000000000000' }, { userId: 3 });
            const res = createMockResponse();

            mocks.findDetailById.mockResolvedValue(null);

            await getServiceRequestDetail(req, res, mockNext);

            expect(mocks.findDetailById).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000000');
            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
            expect(mockResStatus).not.toHaveBeenCalled();
        });

        it('[SEGURIDAD] debe lanzar UnauthorizedError si userId es inválido o no existe en la sesión', async () => {
            const req = createMockRequestWithParams({ id: mockParamId }, { userId: undefined });
            const res = createMockResponse();

            await getServiceRequestDetail(req, res, mockNext);

            expect(mocks.findDetailById).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
        });
    });
});