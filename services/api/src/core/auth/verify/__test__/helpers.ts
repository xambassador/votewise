import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockCache } from "@/storage/__mock__/redis";

import { buildUser } from "../../../../../test/helpers";

export const unverifiedUser = buildUser();
export const verifiedUser = buildUser({ ...unverifiedUser, is_email_verify: true });
export const ip = "192.12.2.45";
export const locals = { meta: { ip } };
export const body = {
  email: unverifiedUser.email,
  user_id: unverifiedUser.id,
  verification_code: "verification_code",
  otp: "123456"
};
export const session = { userId: body.user_id, otp: body.otp, ip };

export function setupHappyPath() {
  mockCache.get.mockResolvedValue(JSON.stringify(session));
  mockUserRepository.findById.mockResolvedValue(unverifiedUser);
  mockCryptoService.verifyOtp.mockReturnValue(true);
}

export { mockUserRepository, mockCache, mockCryptoService };
