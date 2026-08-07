import { Request, Response, NextFunction } from 'express';
import { ServiceRequestRepository } from '../repositories/ServiceRequestRepository.js';
import { UnauthorizedError, NotFoundError, ConflictError } from '../errors/AppError.js';
import pool from '../config/db.js';

const serviceRequestRepository = new ServiceRequestRepository(pool);

/**
 * Permite a un técnico asignarse una solicitud pendiente
 */
export const acceptServiceRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authContext = req as Record<string, any>;
       
        // ─── CAMBIO: Obtenemos el ID del técnico directamente como string (UUID) ───
        const technicianId = authContext.user?.userId;

        // Validamos la sesión e integridad del rol del técnico asegurando que sea un UUID string válido
        if (!technicianId || typeof technicianId !== 'string' || technicianId.trim() === '') {
            throw new UnauthorizedError('Session integrity compromised. Valid UUID technician ID required.');
        }

        // Forzamos la obtención y tipado estricto de string para el ID de la solicitud
        const requestId = req.params.id;

        if (!requestId || typeof requestId !== 'string') {
            throw new NotFoundError('Request ID is required to accept a service.');
        }

        // Intentamos realizar la asignación en la base de datos usando el UUID del técnico
        const updatedRequest = await serviceRequestRepository.assignTechnician(requestId, technicianId);

        if (!updatedRequest) {
            throw new ConflictError(
                'Could not accept the request. It might be already assigned, completed, or does not exist.'
            );
        }

        res.status(200).json({
            success: true,
            message: 'Service request successfully accepted and assigned.',
            data: updatedRequest
        });
    } catch (error) {
        next(error);
    }
};