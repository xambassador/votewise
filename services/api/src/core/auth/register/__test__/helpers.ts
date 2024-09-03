import { mockTaskQueue } from "@/queues/__mock__";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildUser } from "../../../../../test/helpers";

export const user = buildUser();

export function setupHappyPath() {
  mockUserRepository.findByEmail.mockResolvedValue(null);
  mockUserRepository.findByUsername.mockResolvedValue(null);
  mockUserRepository.create.mockResolvedValue(user);
  mockCryptoService.hashPassword.mockResolvedValue("hashed-password");
  mockCryptoService.getOtp.mockReturnValue(123456);
  mockCryptoService.generateUUID.mockReturnValue("some-random-uuid");
  return { hashedPassword: "hashed-password", otp: 123456, uuid: "some-random-uuid" };
}

export function clearAllMocks() {
  mockUserRepository.findByEmail.mockClear();
  mockUserRepository.findByUsername.mockClear();
  mockUserRepository.create.mockClear();
  mockCryptoService.hashPassword.mockClear();
  mockCryptoService.getOtp.mockClear();
  mockCryptoService.generateUUID.mockClear();
}

export { mockTaskQueue, mockUserRepository, mockCryptoService, mockCache };
