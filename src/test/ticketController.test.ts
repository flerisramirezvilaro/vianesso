import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { TicketStatus, UserRole } from '../types/index.js';
import { ValidationError } from '../errors/AppError.js';


// --- 1. HOISTING SEGURO CON VI.HOISTED ---
const { mocks } = vi.hoisted(() => ({
  mocks: {
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    findAllByClient: vi.fn(),
    findByIdWithTech: vi.fn(),
    findStatus: vi.fn(),
    generateTicketCode: vi.fn(),
    handleControllerError: vi.fn(),
    validateId: vi.fn(),
    validateCreate: vi.fn(),
    validateUpdate: vi.fn()
  }
}));

// 🛡️ CORRECCIÓN: Retornamos constructores válidos usando clases para que el "new" no explote
vi.mock('../repositories/PostgresTicketWriteRepository.js', () => ({
  PostgresTicketWriteRepository: class {
    create = mocks.create;
    delete = mocks.delete;
    update = mocks.update;
  }
}));

vi.mock('../repositories/PostgresTicketReadRepository.js', () => ({
  PostgresTicketReadRepository: class {
    findAllByClient = mocks.findAllByClient;
    findByIdWithTech = mocks.findByIdWithTech;
    findStatus = mocks.findStatus;
  }
}));

vi.mock('../utils/ticketValidators.js', () => ({
  TicketValidator: {
    validateId: mocks.validateId,
    validateCreate: mocks.validateCreate,
    validateUpdate: mocks.validateUpdate
  }
}));

vi.mock('../utils/generators.js', () => ({
  generateTicketCode: mocks.generateTicketCode,
}));

vi.mock('../utils/errorHandler.js', () => ({
  handleControllerError: mocks.handleControllerError,
}));

// --- 2. IMPORTACIÓN ESTÁNDAR DEL CONTROLADOR ---
import { 
  createTicket, 
  getClientTickets, 
  getTicketById, 
  deleteTicket, 
  updateClientTicket 
} from '../controllers/ticketController.js';

// --- 3. CONFIGURACIÓN DE MOCKS PARA EXPRESS ---
const mockResJson = vi.fn();
const mockResStatus = vi.fn().mockImplementation(() => ({ json: mockResJson }));

const createMockResponse = (): Response => ({
  status: mockResStatus,
} as unknown as Response);

const createMockRequest = (overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest => ({
  user: { userId: 1, role: UserRole.CLIENT },
  body: {},
  params: {},
  ...overrides,
} as unknown as AuthenticatedRequest);

// --- 4. SUITE DE PRUEBAS ---
describe('ticketController Unit Tests - viaNesso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResStatus.mockReturnValue({ json: mockResJson });

    // Forzamos que los validadores mockeados no rompan por formato
    mocks.validateId.mockImplementation((id) => {
      if (!id || id === 'invalid-id-123') throw new ValidationError('Invalid UUID ticket identifier format. 🔢');
      return id;
    });
    mocks.validateCreate.mockImplementation((input) => input);
    mocks.validateUpdate.mockImplementation((input) => input);
  });

  describe('createTicket', () => {
    it('debe crear un ticket exitosamente con status 201 si el cliente y los datos son válidos', async () => {
      const mockPayload = { client_name: 'Fleris Ramirez', address: 'Sede Principal UNAD' };
      const req = createMockRequest({ body: mockPayload });
      const res = createMockResponse();

      mocks.generateTicketCode.mockReturnValue('TKT-2026-NEX');
      
      const expectedDbResult = { 
        id: 'secure-uuid-001', 
        ticket_code: 'TKT-2026-NEX',
        client_id: 1,
        ...mockPayload,
        status: TicketStatus.PENDING_REVIEW 
      };
      mocks.create.mockResolvedValue(expectedDbResult);

      await createTicket(req, res);

      expect(mocks.create).toHaveBeenCalled();
      expect(mockResStatus).toHaveBeenCalledWith(201);
      expect(mockResJson).toHaveBeenCalledWith({
        success: true,
        message: '¡Ticket de servicio creado con éxito! ',
        ticket: expectedDbResult,
      });
    });

    it('debe interceptar mediante handleControllerError un ValidationError si el rol no es CLIENT', async () => {
      const req = createMockRequest({ user: { userId: 2, role: UserRole.ADMIN } });
      const res = createMockResponse();

      await createTicket(req, res);

      expect(mocks.create).not.toHaveBeenCalled();
      expect(mocks.handleControllerError).toHaveBeenCalledWith(
        res,
        expect.any(ValidationError),
        'Error during ticket creation'
      );
    });
  });

  describe('getClientTickets', () => {
    it('debe listar todos los tickets del cliente con status 200', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const mockTicketsList = [
        { id: 'uuid-1', ticket_code: 'TKT-1', status: TicketStatus.PENDING_REVIEW }
      ];
      mocks.findAllByClient.mockResolvedValue(mockTicketsList);

      await getClientTickets(req, res);

      expect(mocks.findAllByClient).toHaveBeenCalledWith(1);
      expect(mockResStatus).toHaveBeenCalledWith(200);
    });
  });

  describe('getTicketById', () => {
    const validUUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

    it('debe retornar 200 y el ticket detallado si el ID es un UUID válido y existe', async () => {
      const req = createMockRequest({ params: { id: validUUID } });
      const res = createMockResponse();
      const expectedTicket = { id: validUUID, client_name: 'Fleris Ramirez', status: TicketStatus.PENDING_REVIEW };
      mocks.findByIdWithTech.mockResolvedValue(expectedTicket);

      await getTicketById(req, res);

      expect(mocks.findByIdWithTech).toHaveBeenCalledWith(validUUID, 1);
      expect(mockResStatus).toHaveBeenCalledWith(200);
    });

    it('debe retornar status 404 si el repositorio de lectura no encuentra coincidencia legítima', async () => {
      const req = createMockRequest({ params: { id: validUUID } });
      const res = createMockResponse();
      mocks.findByIdWithTech.mockResolvedValue(null);

      await getTicketById(req, res);

      expect(mockResStatus).toHaveBeenCalledWith(404);
    });

    it('debe fallar la validación si el formato de ID no cumple con la estructura UUIDv4', async () => {
      const req = createMockRequest({ params: { id: 'invalid-id-123' } });
      const res = createMockResponse();

      await getTicketById(req, res);

      expect(mocks.handleControllerError).toHaveBeenCalledWith(
        res,
        expect.any(ValidationError),
        'Error fetching ticket details'
      );
    });
  });

  describe('deleteTicket', () => {
    const validUUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

    it('debe ejecutar eliminación física con 200 si el ticket está en estado PENDING_REVIEW', async () => {
      const req = createMockRequest({ params: { id: validUUID } });
      const res = createMockResponse();
      mocks.findStatus.mockResolvedValue({ id: validUUID, status: TicketStatus.PENDING_REVIEW });
      mocks.delete.mockResolvedValue(true);

      await deleteTicket(req, res);

      expect(mocks.findStatus).toHaveBeenCalledWith(validUUID, 1);
      expect(mocks.delete).toHaveBeenCalledWith(validUUID, 1);
      expect(mockResStatus).toHaveBeenCalledWith(200);
    });

    it('debe denegar eliminación lanzando ValidationError si el ticket no está en PENDING_REVIEW', async () => {
      const req = createMockRequest({ params: { id: validUUID } });
      const res = createMockResponse();
      mocks.findStatus.mockResolvedValue({ id: validUUID, status: TicketStatus.DISPATCHED });

      await deleteTicket(req, res);

      expect(mocks.delete).not.toHaveBeenCalled();
      expect(mocks.handleControllerError).toHaveBeenCalledWith(
        res,
        expect.any(ValidationError),
        'Error during ticket deletion'
      );
    });
  });

  describe('updateClientTicket', () => {
    const validUUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

    it('debe actualizar los campos del ticket con 200 si el estado previo es PENDING_REVIEW', async () => {
      const updatePayload = { specific_location: 'Bloque C', access_notes: 'Llamar antes' };
      const req = createMockRequest({ params: { id: validUUID }, body: updatePayload });
      const res = createMockResponse();

      mocks.findStatus.mockResolvedValue({ id: validUUID, status: TicketStatus.PENDING_REVIEW });
      
      const dbUpdateResult = {
        id: validUUID,
        ticket_code: 'TKT-888',
        specific_location: 'Bloque C',
        access_notes: 'Llamar antes',
        status: TicketStatus.PENDING_REVIEW
      };
      mocks.update.mockResolvedValue(dbUpdateResult);

      await updateClientTicket(req, res);

      expect(mocks.update).toHaveBeenCalledWith(validUUID, 1, updatePayload);
      expect(mockResStatus).toHaveBeenCalledWith(200);
    });
  });
});