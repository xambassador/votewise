import type { Mailer } from "@/emails/mailer";
import type { Cache } from "@/storage/redis";
import type { User } from "@votewise/prisma/client";

import { mockMailer } from "../../../../emails/__mock__/mailer";
import { mockUserRepository } from "../../../../repository/__mock__/user.repository";
import { CryptoService } from "../../../../services/crypto.service";
import { mockCache } from "../../../../storage/__mock__/redis";
import { Service } from "../service";

const service = new Service({
  cache: mockCache as unknown as Cache,
  cryptoService: new CryptoService(),
  mailer: mockMailer as unknown as Mailer,
  userRepository: mockUserRepository
});

const body = {
  email: "test@gmail.com",
  password: "password",
  username: "test",
  first_name: "test",
  last_name: "test"
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("User signup service", () => {
  it("Should throw an error if the email already exists", async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(Promise.resolve({ id: "user-id" } as User));
    await expect(service.execute(body)).rejects.toThrow("Email already exists");
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it("Should create a new user", async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(Promise.resolve(null));
    mockUserRepository.create.mockResolvedValueOnce(Promise.resolve({ id: "user-id" } as User));
    await service.execute(body);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: body.email,
      password: body.password,
      user_name: body.username,
      first_name: body.first_name,
      last_name: body.last_name
    });
  });
});
