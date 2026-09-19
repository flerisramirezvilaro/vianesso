import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/AppError";
import { ServiceRequestRepository } from "../repositories/ServiceRequestRepository";
import { StorageService } from "./storageService";
import { ServiceRequestValidator } from "../utils/serviceRequestsValidators";
import { isValidUUID } from "../utils/validators";
import { UserRole } from "../types";

export class ServiceRequestService {
  constructor(private readonly repository: ServiceRequestRepository) {}

  async createRequest(
    clientId: string,
    body: Record<string, unknown>,
    files?: Express.Multer.File[],
  ) {
    const payload = ServiceRequestValidator.validateCreate(body);

    let evidenceUrls: string[] = [];

    if (files?.length) {
      evidenceUrls = await Promise.all(
        files.map((file) => StorageService.saveFile(file)),
      );
    } else if (Array.isArray(body.evidence_urls)) {
      evidenceUrls = body.evidence_urls as string[];
    }

    const request = await this.repository.create(clientId, {
      ...payload,
      evidence_urls: evidenceUrls,
    });

    return {
      success: true,
      data: request,
    };
  }

  async getClientRequests(clientId: string) {
    const requests = await this.repository.findByClientId(clientId);

    return {
      success: true,
      data: requests,
    };
  }

  async getDetail(requestId: string) {
    const detail = await this.repository.findDetailById(requestId);

    if (!detail) {
      throw new NotFoundError(`Service request ${requestId} not found.`);
    }

    return {
      success: true,
      data: detail,
    };
  }

  async getDashboardMetrics(clientId: string) {
    const metrics = await this.repository.getClientMetrics(clientId);

    return {
      success: true,
      data: metrics,
    };
  }

  async getRequestMetrics(clientId: string, role: string) {
    if (role !== UserRole.CLIENT) {
      throw new UnauthorizedError("Insufficient permissions.");
    }

    if (!isValidUUID(clientId)) {
      throw new ValidationError("Invalid client identifier format.");
    }

    const metrics = await this.repository.getRequestMetrics(clientId);

    return {
      success: true,
      data: metrics,
    };
  }
  async acceptRequest(requestId: string, technicianId: string) {
    const request = await this.repository.assignTechnician(
      requestId,
      technicianId,
    );

    if (!request) {
      throw new ConflictError(
        "Could not accept the request. It might be already assigned, completed, or does not exist.",
      );
    }

    return {
      success: true,
      message: "Service request successfully accepted and assigned.",
      data: request,
    };
  }
}
