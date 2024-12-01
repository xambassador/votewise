import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { CryptoService } from "@/services/crypto.service";
import { JWTService } from "@/services/jwt.service";

import { buildUser } from "../../../../../test/helpers";

export const user = buildUser();
export const invalidUser = buildUser({ email: "test@gmail.com" });
const ip = "192.168.4.45";
export const locals = { meta: { ip } };
export const password = "new-password";
export const jwtService = new JWTService({ accessTokenSecret: "secret" });
export const cryptoService = new CryptoService();
export const verificationCode = cryptoService.hash(`${user.id}:${ip}`);
export const invalidVerificationCode = cryptoService.hash(`${user.id}:192.244.22.24`);
export const rid = jwtService.signRid({ email: user.email, verification_code: verificationCode }, user.secret);
export const invalidRid = jwtService.signRid(
  { email: user.email, verification_code: invalidVerificationCode },
  user.secret
);

export function setupHappyPath() {
  mockUserRepository.findByEmail.mockResolvedValue(user);
}

export { mockUserRepository };
