import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";
import { UnauthorizedError, ValidationError } from "../errors/AppError";
import { PostgresUserReadRepository } from "../repositories/PostgresUserReadRepository";
import { PostgresUserWriteRepository } from "../repositories/PostgresUserWriteRepository";
import { LoginInput, RegisterInput } from "../types/auth.types";
import { AuthValidator } from "../utils/authValidators";
import { ENV } from "../config/env";

const userReadRepository = new PostgresUserReadRepository();
const userWriteRepository = new PostgresUserWriteRepository();

export class AuthService {
  async register(data: Partial<RegisterInput>) {
    const validatedData = AuthValidator.validateRegister(data);

    const existingUser = await userReadRepository.findByEmail(
      validatedData.email,
    );

    if (existingUser) {
      throw new ValidationError("An account with this email already exists.");
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    const createdUser = await userWriteRepository.create({
      full_name: validatedData.name,
      email: validatedData.email,
      passwordHash: hashedPassword,
      phone: validatedData.phone ?? null,
      role: validatedData.role,
    });

    return {
      success: true,
      message: "User registered successfully!",
      user: {
        id: createdUser.user_id,
        name: createdUser.full_name,
        email: createdUser.email,
        role: createdUser.role,
      },
    };
  }
  async login(data: Partial<LoginInput>) {
    const validatedCredentials = AuthValidator.validateLogin(data);

    const user = await userReadRepository.findByEmail(
      validatedCredentials.email,
    );

    if (!user) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(
      validatedCredentials.password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials.");
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        role: user.role,
      },
      ENV.JWT_SECRET,
      {
        expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      },
    );

    return {
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        phone: user.phone,
      },
    };
  }
}
