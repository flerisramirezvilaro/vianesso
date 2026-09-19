import { Response } from "express";
import { ValidationError } from "../errors/AppError.js";
import { AuthenticatedRequest } from "../middlewares/authMiddleware.js";
import { UserService } from "../services/UserService.js";
import { handleControllerError } from "../utils/errorHandler.js";

const userService = new UserService();

const ensureUserId = (req: AuthenticatedRequest): string => {
  const userId = req.user?.userId;

  if (!userId || typeof userId !== "string") {
    throw new ValidationError(
      "Authentication context is missing valid user identity UUID.",
    );
  }

  return userId;
};

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = ensureUserId(req);

    const response = await userService.getProfile(userId);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error fetching user profile");
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = ensureUserId(req);

    const response = await userService.updateProfile(
      userId,
      req.body,
      req.file,
    );

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error updating user profile");
  }
};

export const getAllUsersAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const response = await userService.getAllUsers(req.user!.role);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error fetching users registry");
  }
};

export const updateUserPassword = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = ensureUserId(req);

    const response = await userService.updatePassword(userId, req.body);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error updating user password");
  }
};
