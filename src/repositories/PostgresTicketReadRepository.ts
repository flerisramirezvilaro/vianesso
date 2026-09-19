import { query } from "../config/db.js";
import { ITicketReadRepository } from "./ITicketRepository.js";
import { TICKET_QUERIES } from "./queries/ticketQueries.js";
import { CompactTicketDTO, TicketDetailsDTO } from "../types/ticket.types.js";
import { TicketStatus } from "../types/index.js";

export class PostgresTicketReadRepository implements ITicketReadRepository {
  async findAllByClient(clientId: string): Promise<CompactTicketDTO[]> {
    const { rows } = await query<CompactTicketDTO>(
      TICKET_QUERIES.FIND_ALL_BY_CLIENT,
      [clientId],
    );

    return rows.map((row) => ({
      ...row,
      created_at: new Date(row.created_at),
    }));
  }

  async findByIdWithTech(
    id: string,
    clientId: string,
  ): Promise<TicketDetailsDTO | null> {
    const { rows } = await query<TicketDetailsDTO>(
      TICKET_QUERIES.FIND_BY_ID_AND_CLIENT_WITH_TECH,
      [id, clientId],
    );

    return rows[0] ?? null;
  }

  async findStatus(
    id: string,
    clientId: string,
  ): Promise<{
    id: string;
    status: TicketStatus;
  } | null> {
    const { rows } = await query<{
      id: string;
      status: TicketStatus;
    }>(TICKET_QUERIES.FIND_STATUS_ONLY, [id, clientId]);

    return rows[0] ?? null;
  }
}
