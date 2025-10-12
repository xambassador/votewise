import { faker } from "@faker-js/faker";

import { mockTaskQueue } from "@/queues/__mock__";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildUser } from "../../../../../test/helpers";

export const user = buildUser();

export function setupHappyPath() {
  const hashedPassword = faker.string.alphanumeric(32);
  const otp = faker.string.numeric(6);
  const uuid = faker.string.uuid();
  mockUserRepository.findByEmail.mockResolvedValue(undefined);
  mockUserRepository.findByUsername.mockResolvedValue(undefined);
  mockUserRepository.create.mockResolvedValue(user);
  mockCryptoService.hashPassword.mockResolvedValue(hashedPassword);
  mockCryptoService.getOtp.mockReturnValue(otp);
  mockCryptoService.generateUUID.mockReturnValue(uuid);
  mockCryptoService.generateNanoId.mockReturnValue("some-random-username");
  return {
    hashedPassword,
    otp,
    uuid: uuid.replace(/-/g, ""),
    defaultUserName: "some-random-username"
  };
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
