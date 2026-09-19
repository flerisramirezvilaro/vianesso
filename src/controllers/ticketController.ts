import { Response } from "express";

import { ValidationError } from "../errors/AppError.js";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { TicketService } from "../services/TicketService.js";
import { UserRole } from "../types/index.js";
import { handleControllerError } from "../utils/errorHandler.js";

const ticketService = new TicketService();

const ensureClient = (req: AuthenticatedRequest): string => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (!userId || typeof userId !== "string") {
    throw new ValidationError(
      "Authentication context is missing a valid user UUID.",
    );
  }

  if (role !== UserRole.CLIENT) {
    throw new ValidationError("Forbidden. Unauthorized role access.");
  }

  return userId;
};

export const createTicket = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const clientId = ensureClient(req);

    const response = await ticketService.createTicket(clientId, req.body);

    res.status(201).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during ticket creation");
  }
};

export const getClientTickets = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const clientId = ensureClient(req);

    const response = await ticketService.getClientTickets(clientId);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during fetching client tickets");
  }
};

export const getTicketById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const clientId = ensureClient(req);
    const ticketId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const response = await ticketService.getTicketById(ticketId, clientId);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error fetching ticket details");
  }
};

export const deleteTicket = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const clientId = ensureClient(req);
    const ticketId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const response = await ticketService.deleteTicket(ticketId, clientId);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during ticket deletion");
  }
};

export const updateClientTicket = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const clientId = ensureClient(req);
    const ticketId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const response = await ticketService.updateTicket(
      ticketId,
      clientId,
      req.body,
    );

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during ticket update");
  }
};
