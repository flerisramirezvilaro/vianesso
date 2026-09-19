import bcrypt from "bcrypt";
import { NotFoundError, UnauthorizedError } from "../errors/AppError";
import { UserRole } from "../types";
import { UserValidator } from "../utils/userValidators";
import { PostgresUserReadRepository } from "../repositories/PostgresUserReadRepository";
import { PostgresUserWriteRepository } from "../repositories/PostgresUserWriteRepository";
import { StorageService } from "./storageService";
import { mapUserToResponse } from "../utils/userMapper";

const userReadRepository = new PostgresUserReadRepository();

const userWriteRepository = new PostgresUserWriteRepository();

export class UserService {
  async getProfile(userId: string) {
    const user = await userReadRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User profile not found.");
    }

    return {
      success: true,
      user: mapUserToResponse(user),
    };
  }

  async updateProfile(
    userId: string,
    data: Record<string, unknown>,
    file?: Express.Multer.File,
  ) {
    const updateData = { ...data };

    if (file) {
      updateData.avatar_url = file.originalname;
    }

    const validatedData = UserValidator.validateUpdateProfile(updateData);

    if (file) {
      const avatarUrl = await StorageService.saveFile(file);

      validatedData.avatar_url = avatarUrl;
    }

    const updatedUser = await userWriteRepository.updateProfile(
      userId,
      validatedData,
    );

    return {
      success: true,
      message: "Profile updated successfully!",
      user: mapUserToResponse(updatedUser),
    };
  }

  async getAllUsers(role: UserRole) {
    if (role !== UserRole.ADMIN) {
      throw new UnauthorizedError("Administrative privileges required.");
    }

    const users = await userReadRepository.findAll();

    return {
      success: true,
      users: users.map(mapUserToResponse),
    };
  }

  async updatePassword(userId: string, body: Record<string, unknown>) {
    const validatedPasswords = UserValidator.validateUpdatePassword(body);

    const user = await userReadRepository.findAuthById(userId);

    if (!user) {
      throw new NotFoundError("User identity not found.");
    }

    const isMatch = await bcrypt.compare(
      validatedPasswords.current_password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedError(
        "The current password you entered is incorrect.",
      );
    }

    const salt = await bcrypt.genSalt(10);

    const newPasswordHash = await bcrypt.hash(
      validatedPasswords.new_password,
      salt,
    );

    await userWriteRepository.updatePassword(userId, newPasswordHash);

    return {
      success: true,
      message: "Password updated successfully!",
    };
  }
}
