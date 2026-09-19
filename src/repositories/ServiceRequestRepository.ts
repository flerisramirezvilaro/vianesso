import { Pool, PoolClient } from "pg";

import {
  AssignedRequestResult,
  ClientMetricsDTO,
  ClientRequestListItemDTO,
  CreateServiceRequestInput,
  ServiceRequestDetailDTO,
  ServiceRequestDTO,
} from "../types/service.request.repository";

import { IServiceRequestRepository } from "./IServiceRequestRepository";
import { SERVICE_REQUEST_QUERIES } from "./queries/serviceRequestQueries";

export class ServiceRequestRepository implements IServiceRequestRepository {
  constructor(private readonly db: Pool) {}

  public async create(
    clientId: string,
    data: CreateServiceRequestInput,
  ): Promise<ServiceRequestDTO> {
    const values = [
      clientId,
      data.title,
      data.category,
      data.description,
      data.address ?? null,
      data.longitude ?? null,
      data.latitude ?? null,
    ];

    const client = await this.db.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query<ServiceRequestDTO>(
        SERVICE_REQUEST_QUERIES.CREATE,
        values,
      );

      if (rows.length === 0) {
        throw new Error("Service request creation returned no data.");
      }

      const createdRequest = rows[0];

      await this.saveEvidences(
        client,
        createdRequest.request_id,
        data.evidence_urls ?? [],
      );

      await client.query("COMMIT");

      return createdRequest;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public async findByClientId(
    clientId: string,
  ): Promise<ClientRequestListItemDTO[]> {
    const { rows } = await this.db.query<ClientRequestListItemDTO>(
      SERVICE_REQUEST_QUERIES.FIND_BY_CLIENT_ID,
      [clientId],
    );

    return rows;
  }

  public async findDetailById(
    requestId: string,
  ): Promise<ServiceRequestDetailDTO | null> {
    const { rows } = await this.db.query<ServiceRequestDetailDTO>(
      SERVICE_REQUEST_QUERIES.FIND_DETAIL_BY_ID,
      [requestId],
    );

    return rows[0] ?? null;
  }

  public async assignTechnician(
    requestId: string,
    technicianId: string,
  ): Promise<AssignedRequestResult | null> {
    const { rows } = await this.db.query<AssignedRequestResult>(
      SERVICE_REQUEST_QUERIES.ACCEPT_REQUEST,
      [technicianId, requestId],
    );

    return rows[0] ?? null;
  }

  public async getClientMetrics(clientId: string): Promise<ClientMetricsDTO> {
    const { rows } = await this.db.query(
      SERVICE_REQUEST_QUERIES.GET_CLIENT_METRICS,
      [clientId],
    );

    const result = rows[0];

    if (!result) {
      return {
        active_services: 0,
        completed_tasks: 0,
        pending_reviews: 0,
      };
    }

    return {
      active_services: Number(result.active_services) || 0,

      completed_tasks: Number(result.completed_tasks) || 0,

      pending_reviews: Number(result.pending_reviews) || 0,
    };
  }

  public async getRequestMetrics(clientId: string): Promise<{
    pending_review: number;
    active: number;
    history: number;
  }> {
    const { rows } = await this.db.query(
      SERVICE_REQUEST_QUERIES.REQUEST_METRICS,
      [clientId],
    );

    const result = rows[0];

    return {
      pending_review: Number(result?.pending_review_count) || 0,
      active: Number(result?.active_count) || 0,
      history: Number(result?.history_count) || 0,
    };
  }

  private async saveEvidences(
    client: PoolClient,
    requestId: string,
    evidenceUrls: string[],
  ): Promise<void> {
    for (const url of evidenceUrls) {
      if (!url.trim()) {
        continue;
      }

      await client.query(SERVICE_REQUEST_QUERIES.ADD_EVIDENCE, [
        requestId,
        url,
      ]);
    }
  }
}
