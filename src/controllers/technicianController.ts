import { NextFunction, Request, Response } from "express";

import { UnauthorizedError } from "../errors/AppError.js";
import { ServiceRequestService } from "../services/ServiceRequestService.js";
import { ServiceRequestRepository } from "../repositories/ServiceRequestRepository.js";
import pool from "../config/db.js";

const serviceRequestService = new ServiceRequestService(
  new ServiceRequestRepository(pool),
);

const ensureUserId = (
  req: Request & {
    user?: {
      userId?: string;
    };
  },
): string => {
  const userId = req.user?.userId;

  if (!userId || typeof userId !== "string") {
    throw new UnauthorizedError(
      "Session integrity compromised. Valid UUID technician ID required.",
    );
  }

  return userId;
};

export const acceptServiceRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as Request & {
      user?: {
        userId?: string;
      };
    };

    const technicianId = ensureUserId(authReq);

    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const response = await serviceRequestService.acceptRequest(
      requestId,
      technicianId,
    );

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
