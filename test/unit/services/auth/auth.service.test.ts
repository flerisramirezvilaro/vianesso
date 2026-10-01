import { beforeEach, describe, vi, it, expect } from "vitest";
import { AuthService } from "../../../../src/services/AuthService";
import {
  IUserReadRepository,
  IUserWriteRepository,
} from "../../../../src/repositories/IUserRepository";

describe("AuthService", () => {
  let authService: AuthService;

  let userReadRepository = {} as IUserReadRepository;

  let userWriteRepository = {} as IUserWriteRepository;
  beforeEach(() => {
    userReadRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      findAuthById: vi.fn(),
    };

    userWriteRepository = {
      create: vi.fn(),
      updateProfile: vi.fn(),
      updatePassword: vi.fn(),
    };

    authService = new AuthService(userReadRepository, userWriteRepository);
  });
  it("should throw when user does not exist", async () => {
    vi.mocked(userReadRepository.findByEmail).mockResolvedValue(null);

    await expect(
      authService.login({
        email: "test@test.com",
        password: "123456",
      }),
    ).rejects.toThrow("Invalid credentials.");

    expect(userReadRepository.findByEmail).toHaveBeenCalledWith(
      "test@test.com",
    );
  });
});
