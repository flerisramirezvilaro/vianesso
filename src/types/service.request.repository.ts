export interface CreateServiceRequestInput {
    title: string;
    category: string;
    description: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    evidence_urls?: string[];
}

export interface ServiceRequestDTO {
    request_id: string;
    client_id: string;
    title: string;
    category: string;
    description: string;
    address: string | null;
    status: string;
    created_at: Date;
    evidence_urls?:string[];
}

export interface AssignedTechnicianDTO {
    id: string;
    name: string;
    role: string;
    avatar_url: string | null;
}

export interface ServiceRequestDetailDTO {
    request_id: string; 
    status: string;
    category: string;
    reported_at: Date;
    address: string | null;
    description: string;
    assigned_technician: AssignedTechnicianDTO | null;
    evidence_urls: string[]; 
    
}

export interface AssignedRequestResult {
    request_id: string;
    status: string;
    technician_id: string;
}

export interface ClientMetricsDTO {
    active_services: number;
    completed_tasks: number;
    pending_reviews: number;
}