import { faker } from "@faker-js/faker";

import { mockTaskQueue } from "@/queues/__mock__";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { JWTService } from "@/services/jwt.service";

import { appUrl, buildUser, locals } from "../../../../../test/helpers";

export { appUrl, locals };
export const user = buildUser();
export const invalidUser = buildUser();
export const password = faker.internet.password();
export const jwtService = new JWTService({ accessTokenSecret: faker.string.alphanumeric(32) });
export const sessionId = faker.string.uuid();
export const invalidSessionId = "invalid-session-id";
export const sessionData = JSON.stringify({ userId: user.id, email: user.email });
export const sessionDataAsJson = { userId: user.id, email: user.email };

export function setupHappyPath() {
  mockUserRepository.findByEmail.mockResolvedValue(user);
}

export { mockUserRepository, mockCryptoService, mockTaskQueue };
