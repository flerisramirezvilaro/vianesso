import { CreateTicketDbPayload, TicketStatus } from '../types/index.js';
import { CompactTicketDTO, TicketDetailsDTO, TicketDocument } from '../types/ticket.types.js';

export interface TicketData {
    id: string; 
    client_id: string; // ─── CAMBIO: Actualizado a string (UUID) ───
    status: TicketStatus;
    ticket_code: string;
    specific_location?: string;
    access_notes?: string;
}

// DTO (Data Transfer Object) para la creación
export interface CreateTicketDTO {
    ticket_code: string;
    client_id: string; // ─── CAMBIO: Actualizado a string (UUID) ───
    client_name: string;
    address: string;
    specific_location?: string | null;
    access_notes?: string | null;
    status: TicketStatus;
}

export interface ITicketReadRepository {
    findAllByClient(clientId: string): Promise<CompactTicketDTO[]>; // ─── CAMBIO: clientId a string (UUID) ───
    findByIdWithTech(id: string, clientId: string): Promise<TicketDetailsDTO | null>; // ─── CAMBIO: clientId a string (UUID) ───
    findStatus(id: string, clientId: string): Promise<{ id: string; status: TicketStatus } | null>; // ─── CAMBIO: clientId a string (UUID) ───
}

export interface ITicketWriteRepository {
    create(data: CreateTicketDbPayload): Promise<TicketDocument>;
    update(id: string, clientId: string, fields: { specific_location: string | null; access_notes: string | null }): Promise<TicketData>; // ─── CAMBIO: clientId a string (UUID) ───
    delete(id: string, clientId: string): Promise<boolean>; // ─── CAMBIO: clientId a string (UUID) ───
}