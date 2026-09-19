import {
  ClientRequestListItemDTO,
  ServiceRequestDetailDTO,
  ServiceRequestDTO,
} from "../types/service.request.repository";

export const mapCreatedRequest = (
  request: ServiceRequestDTO,
  evidenceUrls: string[],
) => ({
  ...request,
  id: `#VN-${request.request_id.slice(0, 4)}`,
  technician_name: null,
  evidence_urls: evidenceUrls,
});

export const mapRequestListItem = (request: ClientRequestListItemDTO) => ({
  id: `#VN-${request.id.slice(0, 4)}`,
  uuid: request.uuid,
  title: request.title,
  category: request.category,
  description: request.description,
  address: request.address,
  status: request.status,
  created_at: request.created_at,
  technician_name: request.technician_name ?? "Sin asignar",
});

export const mapRequestDetail = (detail: ServiceRequestDetailDTO) => detail;
