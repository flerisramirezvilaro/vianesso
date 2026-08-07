import { Pool } from 'pg';
import { AssignedRequestResult, CreateServiceRequestInput, ServiceRequestDetailDTO, ServiceRequestDTO } from '../types/service.request.repository';
import { IServiceRequestRepository } from './IServiceRequestRepository';
import { SERVICE_REQUEST_QUERIES } from './queries/serviceRequestQueries';


export class ServiceRequestRepository implements IServiceRequestRepository {
    constructor(private readonly db: Pool) {}

    /**
     *  Inserta una nueva solicitud en la base de datos
     */
   public async create(client_id: string, data: CreateServiceRequestInput): Promise<ServiceRequestDTO> {
    const values = [
        client_id,
        data.title,
        data.category,
        data.description,
        data.address ?? null,
        data.longitude ?? null,
        data.latitude ?? null
    ];

    // Obtenemos un cliente de conexión de la pool para manejar la transacción de forma aislada
    const client = await this.db.connect();

    try {
        // 1. Iniciamos la transacción
        await client.query('BEGIN');

        // 2. Insertamos la solicitud base
        const { rows } = await client.query(SERVICE_REQUEST_QUERIES.CREATE, values);
        
        if (!rows?.length) {
            throw new Error('Database insertion succeeded but returned an empty structural payload.');
        }

        const newRequest = rows[0] as ServiceRequestDTO;
        const requestId = newRequest.request_id;

        // 3. Insertamos las evidencias en la nueva tabla (si vienen en el payload y contienen datos)
        const savedEvidences: string[] = [];
        if (data.evidence_urls && Array.isArray(data.evidence_urls) && data.evidence_urls.length > 0) {
            for (const url of data.evidence_urls) {
                if (url && url.trim() !== "") {
                    await client.query(SERVICE_REQUEST_QUERIES.ADD_EVIDENCE, [requestId, url]);
                    savedEvidences.push(url);
                }
            }
        }

        // 4. Consolidamos la transacción si  salió bien
        await client.query('COMMIT');

        // Retornamos el DTO de la solicitud inyectándole las evidencias guardadas para el response final
        return {
            ...newRequest,
            evidence_urls: savedEvidences
        };

    } catch (error) {
        // Si algo falla, revertimos cualquier cambio hecho en la base de datos
        await client.query('ROLLBACK');
        throw new Error(`[Database Transaction Failure] Insertion halted on service request context: ${(error as Error).message}`);
    } finally {
        // Siempre liberamos el cliente de vuelta a la pool
        client.release();
    }
}

    /**
     *  Recupera el historial de un cliente específico en reversa cronológica
     */
    public async findByClientId(client_id: string): Promise<ServiceRequestDTO[]> {
        try {
            const { rows } = await this.db.query(SERVICE_REQUEST_QUERIES.FIND_BY_CLIENT_ID, [client_id]);
            return (rows ?? []) as ServiceRequestDTO[];
        } catch (error) {
            throw new Error(`[Database Core Failure] Execution failed for client_id ${client_id}: ${(error as Error).message}`);
        }
    }
    /**
     *  Recupera el detalle completo de una solicitud (Vista de Figma)
     */
   /**
     *  Recupera el detalle completo de una solicitud junto a su técnico asignado (Figma View)
     */
   /**
     *  Recupera el detalle completo de una solicitud junto a su técnico asignado (Figma View)
     */
    public async findDetailById(request_id: string): Promise<ServiceRequestDetailDTO | null> {
        try {
            const { rows } = await this.db.query(SERVICE_REQUEST_QUERIES.FIND_DETAIL_BY_ID, [request_id]);
            
            if (!rows || rows.length === 0) {
                return null;
            }

            const row = rows[0];

            return {
            request_id: row.request_id,
            status: row.status,
            category: row.category,
            reported_at: row.created_at,
            address: row.address,
            description: row.description,
            evidence_urls: row.evidence_urls || [], 
            assigned_technician: row.technician_id ? {
                id: row.technician_id,
                name: row.technician_name,
                role: row.technician_role,
                avatar_url: row.technician_avatar || ""
            } : null
        };
            
        } catch (error) {
            throw new Error(`[Database Core Failure] Execution failed for request_id ${request_id}: ${(error as Error).message}`);
        }
    }

   public async assignTechnician(request_id: string, technician_id: string): Promise<AssignedRequestResult | null> {
    try {
        const result = await this.db.query(
            SERVICE_REQUEST_QUERIES.ACCEPT_REQUEST, 
            [technician_id, request_id]
        );

        if (!result.rows || result.rows.length === 0) {
            return null;
        }

        return result.rows[0] as AssignedRequestResult;
    } catch (error) {
        throw new Error(`[Database Core Failure] Failed to assign technician ${technician_id} to request ${request_id}: ${(error as Error).message}`);
    }
}
 

}