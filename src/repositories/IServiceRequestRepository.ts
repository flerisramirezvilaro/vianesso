import { AssignedRequestResult, CreateServiceRequestInput, ServiceRequestDetailDTO, ServiceRequestDTO } from "../types/service.request.repository";

export interface IServiceRequestRepository {
    create(client_id: string, data: CreateServiceRequestInput): Promise<ServiceRequestDTO>;
    findByClientId(client_id: string): Promise<ServiceRequestDTO[]>;
    findDetailById(request_id: string): Promise<ServiceRequestDetailDTO | null>; 
    assignTechnician(request_id: string, technician_id: string): Promise<AssignedRequestResult | null>;
}