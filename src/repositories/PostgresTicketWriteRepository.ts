import { query } from "../config/db.js";

import { ITicketWriteRepository } from "./ITicketRepository.js";
import { TICKET_QUERIES } from "./queries/ticketQueries.js";

import { CreateTicketDbPayload } from "../types/index.js";

import { TicketDocument } from "../types/ticket.types.js";

export class PostgresTicketWriteRepository implements ITicketWriteRepository {
  async create(data: CreateTicketDbPayload): Promise<TicketDocument> {
    const values = [
      data.ticket_code,
      data.client_id,
      data.client_name,
      data.address,
      data.specific_location ?? null,
      data.access_notes ?? null,
      data.status,
    ];

    const { rows } = await query<TicketDocument>(TICKET_QUERIES.CREATE, values);

    if (rows.length === 0) {
      throw new Error("Ticket creation returned no data.");
    }

    return rows[0];
  }

  async update(
    id: string,
    clientId: string,
    fields: {
      specific_location: string | null;
      access_notes: string | null;
    },
  ): Promise<TicketDocument> {
    const { rows } = await query<TicketDocument>(TICKET_QUERIES.UPDATE, [
      fields.specific_location,
      fields.access_notes,
      id,
      clientId,
    ]);

    if (rows.length === 0) {
      throw new Error("Ticket update returned no data.");
    }

    return rows[0];
  }

  async delete(id: string, clientId: string): Promise<boolean> {
    const result = await query(TICKET_QUERIES.DELETE, [id, clientId]);

    const affectedRows = result.rowCount ?? 0;

    return affectedRows > 0;
  }
}
