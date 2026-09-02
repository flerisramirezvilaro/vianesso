import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storageService.js';
import { ServiceRequestValidator } from '../utils/serviceRequestsValidators.js';
import { NotFoundError, UnauthorizedError } from '../errors/AppError.js';
import { ServiceRequestRepository } from '../repositories/ServiceRequestRepository.js';
import pool from '../config/db.js';

const serviceRequestRepository = new ServiceRequestRepository(pool);

/**
 * Registra un nuevo reporte adaptado al estándar estricto de Express
 */
export const createRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authContext = req as Record<string, any>;
        const client_id = authContext.user?.userId;

        // ─── CAMBIO: Validamos que sea un string (UUID) en lugar de un número ───
        if (typeof client_id !== 'string' || client_id.trim() === '') {
            throw new UnauthorizedError('Session integrity compromised. Valid UUID user ID required.');
        }

        // 1. Validación inmutable del cuerpo de la petición
        const strictPayload = ServiceRequestValidator.validateCreate(req.body);
        
        // 2. Procesar evidencias (Acepta tanto archivos físicos como URLs directas en el JSON)
        let evidenceUrls: string[] = [];
        
        // Modalidad A: Vienen archivos físicos en la petición (Form-Data)
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            evidenceUrls = await Promise.all(
                (req.files as Express.Multer.File[]).map(file => StorageService.saveFile(file))
            );
        } 
        // Modalidad B: Vienen URLs ya listas en el body JSON (Prueba de Insomnia o subida previa en Front)
        else if (req.body.evidence_urls && Array.isArray(req.body.evidence_urls)) {
            evidenceUrls = req.body.evidence_urls;
        }

        // Persistencia directa
        const newRequest = await serviceRequestRepository.create(client_id, {
            ...strictPayload,
            evidence_urls: evidenceUrls 
        });

        res.status(201).json({
            success: true,
            data: newRequest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Recupera el historial para la pantalla "Mis Solicitudes"
 */
export const getClientRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
       const authContext = req as Record<string, any>;
       const client_id = authContext.user?.userId;

       // ─── CAMBIO: Validamos que sea un string (UUID) ───
       if (typeof client_id !== 'string' || client_id.trim() === '') {
           throw new UnauthorizedError('Session integrity compromised. Valid UUID user ID required.');
       }

        const requests = await serviceRequestRepository.findByClientId(client_id);

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

export const getServiceRequestDetail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // 1. Forzamos de forma segura que el id sea un string único e inequívoco
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        
        // 2. Extraemos el contexto del usuario ajustado a string (UUID)
        const authenticatedReq = req as Request & { user?: { userId: string } };
        const userId = authenticatedReq.user?.userId;

        // ─── CAMBIO: Validamos que userId sea un string válido ───
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            throw new UnauthorizedError('Acceso denegado. Sesión inválida o corrupta.');
        }

        // 3. Consulta directa al Repositorio Tipado
        const detail = await serviceRequestRepository.findDetailById(id);

        if (!detail) {
            throw new NotFoundError(`No se encontró ninguna solicitud de servicio con el ID: ${id}`);
        }

        // 4. Respuesta Exitosa Limpia y Estructurada
        res.status(200).json({
            success: true,
            data: detail
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Recupera las métricas para el dashboard del cliente
 */
export const getClientDashboardMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authContext = req as Record<string, any>;
        const client_id = authContext.user?.userId;
       
        if (typeof client_id !== 'string' || client_id.trim() === '') {
            throw new UnauthorizedError('Session integrity compromised. Valid UUID user ID required.');
        }

        const metrics = await serviceRequestRepository.getClientMetrics(client_id);
       
        res.status(200).json({
            success: true,
            data: metrics
        });
    } catch (error) {
     
        res.status(500).json({
            success: false,
           message: "Error interno"
        });
    }
};