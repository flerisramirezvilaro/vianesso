import { AssignedRequestResult, ClientMetricsDTO, ClientRequestListItemDTO, CreateServiceRequestInput, ServiceRequestDetailDTO, ServiceRequestDTO } from "../types/service.request.repository";

export interface IServiceRequestRepository {
    create(client_id: string, data: CreateServiceRequestInput): Promise<ServiceRequestDTO>;
    findByClientId(client_id: string): Promise<ClientRequestListItemDTO[]>;
    findDetailById(request_id: string): Promise<ServiceRequestDetailDTO | null>; 
    assignTechnician(request_id: string, technician_id: string): Promise<AssignedRequestResult | null>;
    getClientMetrics(client_id: string): Promise<ClientMetricsDTO>;
}