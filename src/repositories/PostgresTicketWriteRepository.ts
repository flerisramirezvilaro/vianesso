import { ITicketWriteRepository } from './ITicketRepository.js';
import { query } from '../config/db.js';
import { TICKET_QUERIES } from './queries/ticketQueries.js';
import { CreateTicketDbPayload } from '../types/index.js';
import { TicketDocument } from '../types/ticket.types.js';

export class PostgresTicketWriteRepository implements ITicketWriteRepository {
    async create(data: CreateTicketDbPayload): Promise<TicketDocument> {
       try {
            const values = [
                data.ticket_code, 
                data.client_id, 
                data.client_name, 
                data.address, 
                data.specific_location ?? null, 
                data.access_notes ?? null, 
                data.status
            ];
            
            const result = await query(TICKET_QUERIES.CREATE, values);
            
            if (!result?.rows?.[0]) {
                throw new Error('Insert query failed to return data.');
            }
            
            return result.rows[0] as TicketDocument;
        } catch (error) {
            console.error(' [Database Write Exception] Ticket creation failed:', error);
            throw new Error('Database write operation failed.');
        }
    }

    async update(id: string, clientId: string, fields: { specific_location: string | null; access_notes: string | null }): Promise<any> {
        try {
            const result = await query(TICKET_QUERIES.UPDATE, [fields.specific_location, fields.access_notes, id, clientId]);
            if (!result?.rows?.[0]) throw new Error('Update execution failed to return rows.');
            return result.rows[0];
        } catch (error) {
            console.error(` [Database Write Exception] Update failed on ticket ${id}:`, error);
            throw new Error('Database modification failed.');
        }
    }

    async delete(id: string, clientId: string): Promise<boolean> {
        try {
            const result = await query(TICKET_QUERIES.DELETE, [id, clientId]);
            return (result?.rowCount ?? 0) > 0;
        } catch (error) {
            console.error(`[Database Write Exception] Deletion failed on ticket ${id}:`, error);
            throw new Error('Database deletion failed.');
        }
    }
}