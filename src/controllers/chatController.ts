import { Response } from "express";

import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { UserRole } from "../types/index.js";

import { ValidationError } from "../errors/AppError.js";

import { handleControllerError } from "../utils/errorHandler.js";

import { ensureSingleString } from "../utils/typeGuards.js";

import { isValidUUID } from "../utils/validators.js";
import { chatService } from "../services/ChatService.js";

const getAuthenticatedUserContext = (
  req: AuthenticatedRequest,
): {
  userId: string;
  role: UserRole;
} => {
  const userId = req.user?.userId;
  const role = req.user?.role;

  if (typeof userId !== "string" || !isValidUUID(userId) || !role) {
    throw new ValidationError("Forbidden. Session integrity compromised.");
  }

  return {
    userId,
    role,
  };
};

export const getActiveChannels = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId, role } = getAuthenticatedUserContext(req);

    const response = await chatService.getActiveChannels(userId, role);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(
      res,
      error,
      "Error during fetching active chat channels",
    );
  }
};

export const sendChatMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId, role } = getAuthenticatedUserContext(req);

    const ticketId = ensureSingleString(req.params.ticketId);

    const response = await chatService.sendChatMessage(
      userId,
      role,
      ticketId,
      req.body,
    );

    res.status(201).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during sending chat message");
  }
};
