import { ITicketReadRepository } from './ITicketRepository.js';
import { query } from '../config/db.js';
import { TICKET_QUERIES } from './queries/ticketQueries.js';
import { CompactTicketDTO, TicketDetailsDTO } from '../types/ticket.types.js';
import { TicketStatus } from '../types/index.js';

export class PostgresTicketReadRepository implements ITicketReadRepository {
    async findAllByClient(clientId: string): Promise<CompactTicketDTO[]> {
        try {
            const result = await query(TICKET_QUERIES.FIND_ALL_BY_CLIENT, [clientId]);
            if (!result?.rows) throw new Error('Unexpected empty database structure.');
            return result.rows.map(row => ({
                id: row.id as string,
                ticket_code: row.ticket_code as string,
                client_name: row.client_name as string,
                address: row.address as string,
                specific_location: row.specific_location as string | null,
                access_notes: row.access_notes as string | null,
                status: row.status as TicketStatus, 
                created_at: new Date(row.created_at)
            }));
        } catch (error) {
            console.error(`[Database Read Exception] Error listing tickets for client ${clientId}:`, error);
            throw new Error('Database fetch operation failed.');
        }
    }

  async findByIdWithTech(id: string, clientId: string): Promise<TicketDetailsDTO | null> {
        try {
            const result = await query(TICKET_QUERIES.FIND_BY_ID_AND_CLIENT_WITH_TECH, [id, clientId]);
            
            if (!result?.rows) {
                throw new Error('[Database Error] Unexpected empty structure from database query.');
            }
            
        
            return (result.rows[0] as TicketDetailsDTO) || null;
        } catch (error) {
            console.error(` [Database Read Exception] Error checking detailed ticket ${id}:`, error);
            throw new Error('Database fetch operation failed.');
        }
    }

    async findStatus(id: string, clientId: string): Promise<{ id: string; status: TicketStatus } | null> {
        try {
            const result = await query(TICKET_QUERIES.FIND_STATUS_ONLY, [id, clientId]);
            
            if (!result?.rows) {
                throw new Error('[Database Error] Unexpected empty structure from database query.');
            }

            if (result.rows.length === 0) {
                return null;
            }

            
            const row = result.rows[0];
            return {
                id: row.id as string,
                status: row.status as TicketStatus 
            };

        } catch (error) {
            console.error(` [Database Read Exception] Error checking status for ticket ${id}:`, error);
            throw new Error('Database check operation failed.');
        }
    }
}