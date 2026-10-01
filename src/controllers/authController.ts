import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";
import { LoginInput, RegisterInput } from "../types/auth.types.js";
import { handleControllerError } from "../utils/errorHandler.js";
import { PostgresUserReadRepository } from "../repositories/PostgresUserReadRepository.js";
import { PostgresUserWriteRepository } from "../repositories/PostgresUserWriteRepository.js";

const authService = new AuthService(
  new PostgresUserReadRepository(),
  new PostgresUserWriteRepository(),
);

export const register = async (
  req: Request & { body: Partial<RegisterInput> },
  res: Response,
): Promise<void> => {
  try {
    const response = await authService.register(req.body);

    res.status(201).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during user registration");
  }
};

export const login = async (
  req: Request & { body: Partial<LoginInput> },
  res: Response,
): Promise<void> => {
  try {
    const response = await authService.login(req.body);

    res.status(200).json(response);
  } catch (error) {
    handleControllerError(res, error, "Error during user login");
  }
};
