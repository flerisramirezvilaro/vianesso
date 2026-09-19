import { NextFunction, Request, Response } from "express";

import pool from "../config/db.js";
import { UnauthorizedError } from "../errors/AppError.js";
import { ServiceRequestRepository } from "../repositories/ServiceRequestRepository.js";
import { ServiceRequestService } from "../services/ServiceRequestService.js";

const serviceRequestService = new ServiceRequestService(
  new ServiceRequestRepository(pool),
);

const ensureUserId = (
  req: Request & {
    user?: { userId?: string };
  },
): string => {
  const userId = req.user?.userId;

  if (!userId || typeof userId !== "string") {
    throw new UnauthorizedError(
      "Session integrity compromised. Valid UUID user ID required.",
    );
  }

  return userId;
};

export const createRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = ensureUserId(
      req as Request & {
        user?: { userId?: string };
      },
    );

    const response = await serviceRequestService.createRequest(
      userId,
      req.body,
      req.files as Express.Multer.File[] | undefined,
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const getClientRequests = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = ensureUserId(
      req as Request & {
        user?: { userId?: string };
      },
    );

    const response = await serviceRequestService.getClientRequests(userId);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getServiceRequestDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const response = await serviceRequestService.getDetail(requestId);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getClientDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = ensureUserId(
      req as Request & {
        user?: { userId?: string };
      },
    );

    const response = await serviceRequestService.getDashboardMetrics(userId);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRequestMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authReq = req as Request & {
      user?: {
        userId?: string;
        role?: string;
      };
    };

    const userId = ensureUserId(authReq);

    const role = authReq.user?.role;

    const response = await serviceRequestService.getRequestMetrics(
      userId,
      role ?? "",
    );

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
