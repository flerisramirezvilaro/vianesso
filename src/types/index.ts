
import { Socket } from 'socket.io';
export enum UserRole{
    ADMIN = 'ADMIN',
    TECHNICIAN = 'TECHNICIAN',
    CLIENT = 'CLIENT'
} 

export enum TicketStatus {
    PENDING_REVIEW = 'pending_review', 
    DISPATCHED = 'dispatched',         
    EN_ROUTE = 'en_route',             
    ON_SITE = 'on_site',              
    CLOSED = 'closed'                  
}


export interface CreateTicketInput {
    client_name: string;
    address: string;
    specific_location?: string | null;
    access_notes?: string | null;
}



export enum AuthErrorCode {
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    NO_TOKEN = 'NO_TOKEN',
    UNAUTHORIZED = 'UNAUTHORIZED'
}

export enum TicketErrorCode {
    INVALID_ID = 'INVALID_ID',
    NOT_FOUND = 'TICKET_NOT_FOUND',
    CANNOT_DELETE = 'TICKET_CANNOT_BE_DELETED',
    CANNOT_UPDATE = 'TICKET_CANNOT_BE_UPDATED' 
}


export interface CreateTicketDbPayload extends CreateTicketInput {
    ticket_code: string;
    client_id: string;
    status: TicketStatus;
}
export interface AuthenticatedSocket extends Socket {
    user?: {
        userId: string;
        role: UserRole;
    };
}