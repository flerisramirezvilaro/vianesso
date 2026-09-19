import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { PostgresTicketReadRepository } from "../repositories/PostgresTicketReadRepository.js";
import { PostgresTicketWriteRepository } from "../repositories/PostgresTicketWriteRepository.js";
import { TicketStatus } from "../types/index.js";
import { generateTicketCode } from "../utils/generators.js";
import { TicketValidator } from "../utils/ticketValidators.js";

const ticketReadRepository = new PostgresTicketReadRepository();

const ticketWriteRepository = new PostgresTicketWriteRepository();

export class TicketService {
  async createTicket(clientId: string, body: Record<string, unknown>) {
    const validatedData = TicketValidator.validateCreate(body);

    const ticketCode = generateTicketCode();

    const ticket = await ticketWriteRepository.create({
      ...validatedData,
      ticket_code: ticketCode,
      client_id: clientId,
      status: TicketStatus.PENDING_REVIEW,
    });

    return {
      success: true,
      message: "¡Ticket de servicio creado con éxito!",
      ticket,
    };
  }

  async getClientTickets(clientId: string) {
    const tickets = await ticketReadRepository.findAllByClient(clientId);

    return {
      success: true,
      count: tickets.length,
      tickets,
    };
  }

  async getTicketById(ticketId: string, clientId: string) {
    const validatedId = TicketValidator.validateId(ticketId);

    const ticket = await ticketReadRepository.findByIdWithTech(
      validatedId,
      clientId,
    );

    if (!ticket) {
      throw new NotFoundError("Ticket not found or unauthorized access.");
    }

    return {
      success: true,
      ticket,
    };
  }

  async deleteTicket(ticketId: string, clientId: string) {
    const validatedId = TicketValidator.validateId(ticketId);

    const ticket = await ticketReadRepository.findStatus(validatedId, clientId);

    if (!ticket) {
      throw new NotFoundError("Ticket not found or unauthorized access.");
    }

    if (ticket.status !== TicketStatus.PENDING_REVIEW) {
      throw new ValidationError(
        `Cannot delete a ticket that is already in state: ${ticket.status}.`,
      );
    }

    await ticketWriteRepository.delete(validatedId, clientId);

    return {
      success: true,
      message: "Ticket deleted successfully using secure UUID.",
    };
  }

  async updateTicket(
    ticketId: string,
    clientId: string,
    body: Record<string, unknown>,
  ) {
    const validatedId = TicketValidator.validateId(ticketId);

    const validatedFields = TicketValidator.validateUpdate(body);

    const ticket = await ticketReadRepository.findStatus(validatedId, clientId);

    if (!ticket) {
      throw new NotFoundError("Ticket not found or unauthorized access.");
    }

    if (ticket.status !== TicketStatus.PENDING_REVIEW) {
      throw new ValidationError(
        `Cannot update a ticket that is already in state: ${ticket.status}.`,
      );
    }

    const updatedTicket = await ticketWriteRepository.update(
      validatedId,
      clientId,
      validatedFields,
    );

    return {
      success: true,
      message: "Ticket updated successfully.",
      ticket: {
        id: updatedTicket.id,
        code: updatedTicket.ticket_code,
        specificLocation: updatedTicket.specific_location,
        accessNotes: updatedTicket.access_notes,
        status: updatedTicket.status,
      },
    };
  }
}
