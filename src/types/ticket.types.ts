
import { TicketStatus } from './index.js';

export interface TicketDetailsDTO {
    id: string;
    ticket_code: string;
    client_name: string;
    address: string;
    specific_location: string | null;
    access_notes: string | null;
    status: TicketStatus;
    created_at: Date;
    technician_name: string | null;  
    technician_phone: string | null; 
}

export interface CompactTicketDTO {
    id: string;
    ticket_code: string;
    client_name: string;
    address: string;
    specific_location: string | null;
    access_notes: string | null;
    status: TicketStatus;
    created_at: Date;
}

export interface TicketDocument {
    id: string;
    ticket_code: string;
    client_id: string;
    client_name: string;
    address: string;
    specific_location: string | null;
    access_notes: string | null;
    status: TicketStatus;
    created_at?: Date;
    updated_at?: Date;
}