import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { TicketStatus, UserRole } from '../types/index.js';
import { generateTicketCode } from '../utils/generators.js';
import { ValidationError } from '../errors/AppError.js';
import { handleControllerError } from '../utils/errorHandler.js';
import { TicketValidator } from '../utils/ticketValidators.js';
import { PostgresTicketReadRepository } from '../repositories/PostgresTicketReadRepository.js';
import { PostgresTicketWriteRepository } from '../repositories/PostgresTicketWriteRepository.js';
import { isValidExpressResponse } from '../utils/typeGuards.js';

const ticketReadRepository = new PostgresTicketReadRepository();
const ticketWriteRepository = new PostgresTicketWriteRepository();

const checkClientRole = (req: AuthenticatedRequest): string => {
    if (req?.user?.role !== UserRole.CLIENT) {
        throw new ValidationError('Forbidden. Unauthorized role access.'); // Lanzará un 400/403 controlado
    }
    return req.user.userId;
};

export const createTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req || !isValidExpressResponse(res)) {
            console.error(' [Critical Infrastructure Error]: Express req or res object is missing.');
            return; 
        }
        const client_id = checkClientRole(req);
        const validatedData = TicketValidator.validateCreate(req.body);
        const ticketCode = generateTicketCode();

        const newTicket = await ticketWriteRepository.create({
            ...validatedData,
            ticket_code: ticketCode,
            client_id,
            status: TicketStatus.PENDING_REVIEW
        });

        res.status(201).json({ success: true, message: '¡Ticket de servicio creado con éxito! ', ticket: newTicket });
    } catch (error) {
        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during ticket creation');
        } else {
            console.error(' [Fatal Catch Error] Cannot respond to client because res object is corrupt:', error);
        }
       
    }
};

export const getClientTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req || !isValidExpressResponse(res)) {
            console.error('[Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }
        const client_id = checkClientRole(req);
        const tickets = await ticketReadRepository.findAllByClient(client_id);

        res.status(200).json({ success: true, count: tickets.length, tickets });
    } catch (error) {
        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during fetching client tickets');
        } else {
            console.error(' [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};

export const getTicketById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req || !isValidExpressResponse(res)) {
            console.error(' [Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }
        const client_id = checkClientRole(req);
        const id = TicketValidator.validateId(req.params?.id as string);

        const ticket = await ticketReadRepository.findByIdWithTech(id, client_id);
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found or unauthorized access. 🔍' });
            return;
        }

        res.status(200).json({ success: true, ticket });
    } catch (error) {
       if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error fetching ticket details');
        } else {
            console.error(' [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};

export const deleteTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      
        if (!req || !isValidExpressResponse(res)) {
            console.error(' [Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }

        // 2. Control de rol (Lanza ValidationError interna si falla)
        const client_id = checkClientRole(req);

        // 🛡️ 3. Validación estricta del ID (Eliminado el 'as string' frágil)
        const id = TicketValidator.validateId(req.params?.id as string);

        
        const ticket = await ticketReadRepository.findStatus(id, client_id);
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found or unauthorized access. ' });
            return;
        }

        //   Regla de negocio: Solo se pueden eliminar si están en PENDING_REVIEW
        if (ticket.status !== TicketStatus.PENDING_REVIEW) {
            throw new ValidationError(`Cannot delete a ticket that is already in state: ${ticket.status}. `);
        }

        //  Eliminación física/lógica delegada al repositorio de escritura
        await ticketWriteRepository.delete(id, client_id);

        res.status(200).json({ 
            success: true, 
            message: 'Ticket deleted successfully using secure UUID. 🗑️' 
        });

    } catch (error) {
       
        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during ticket deletion');
        } else {
            console.error(' [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};

export const updateClientTicket = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        
        if (!req || !isValidExpressResponse(res)) {
            console.error('🚨 [Critical Infrastructure Error]: Express req or res object is missing or invalid.');
            return;
        }

        //  Control de rol (Lanza ValidationError si no es CLIENT)
        const client_id = checkClientRole(req);
       
        // . Validación estricta del ID (Eliminado el 'as string' manual)
        const id = TicketValidator.validateId(req.params?.id as string);
        const validatedFields = TicketValidator.validateUpdate(req.body);

        //  Verificar existencia y estado del ticket en el repositorio de lectura
        const ticket = await ticketReadRepository.findStatus(id, client_id);
        if (!ticket) {
            res.status(404).json({ message: 'Ticket not found or unauthorized access. ' });
            return;
        }

        //  Regla de negocio: Si ya fue procesado, congelamos la edición
        if (ticket.status !== TicketStatus.PENDING_REVIEW) {
            throw new ValidationError(`Cannot update a ticket that is already in state: ${ticket.status}.`);
        }

        // 6. Actualización delegada al repositorio de escritura
        const updatedTicket = await ticketWriteRepository.update(id, client_id, validatedFields);

       
        res.status(200).json({ 
            success: true, 
            message: 'Ticket updated successfully. ', 
            ticket: {
                id: updatedTicket.id,
                code: updatedTicket.ticket_code,
                specificLocation: updatedTicket.specific_location,
                accessNotes: updatedTicket.access_notes,
                status: updatedTicket.status
            }
        });

    } catch (error) {

        if (isValidExpressResponse(res)) {
            handleControllerError(res, error, 'Error during ticket update');
        } else {
            console.error(' [Fatal Catch Error] Cannot respond because res object is corrupt:', error);
        }
    }
};