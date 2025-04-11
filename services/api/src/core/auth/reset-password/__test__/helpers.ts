import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { JWTService } from "@/services/jwt.service";

import { buildUser } from "../../../../../test/helpers";

export const user = buildUser();
export const invalidUser = buildUser({ email: "test@gmail.com" });
const ip = "192.168.4.45";
export const locals = { meta: { ip } };
export const password = "new-password";
export const jwtService = new JWTService({ accessTokenSecret: "secret" });
export const sessionId = "session-id";
export const invalidSessionId = "invalid-session-id";
export const sessionData = JSON.stringify({ userId: user.id, email: user.email });
export const sessionDataAsJson = { userId: user.id, email: user.email };

export function setupHappyPath() {
  mockUserRepository.findByEmail.mockResolvedValue(user);
}

export { mockUserRepository, mockCryptoService };
