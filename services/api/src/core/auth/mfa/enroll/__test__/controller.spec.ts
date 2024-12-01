import type { AppContext } from "@/context";

import { Assertions } from "@votewise/errors";

import { mockFactorRepository } from "@/repository/__mock__/factor.repository";
import { mockUserRepository } from "@/repository/__mock__/user.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";

import { buildAccessToken, buildFactor, buildReq, buildRes, buildUser } from "../../../../../../test/helpers";
import { Controller } from "../controller";

/* ----------------------------------------------------------------------------------------------- */

const controller = new Controller({
  userRepository: mockUserRepository,
  factorRepository: mockFactorRepository,
  environment: { APP_SECRET: "app_secret" } as unknown as AppContext["environment"],
  cryptoService: mockCryptoService,
  config: { appName: "Votewise" } as unknown as AppContext["config"],
  assert: new Assertions()
});

const ip = "192.168.2.25";
const params = { factor_id: "factor_id" };
const session = { ip, userAgent: "userAgent", aal: "aal1" };
const user = buildUser();
const factor = buildFactor({ user_id: user.id });
const payload = buildAccessToken({ sub: user.id, email: user.email });
const locals = { meta: { ip }, session, payload };

describe("MFA Enroll Controller", () => {
  test("should throw error if user is not found", async () => {
    const req = buildReq({ params });
    const res = buildRes({ locals });

    mockUserRepository.findById.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("A valid session and a registered user are required to enroll a factor");
  });

  test("should throw error if user already has a TOTP factor", async () => {
    const req = buildReq({ params });
    const res = buildRes({ locals });

    mockUserRepository.findById.mockResolvedValue(user);
    mockFactorRepository.findByUserIdAndType.mockResolvedValue(factor);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("User already has a TOTP factor");
  });

  test("should enroll a TOTP factor", async () => {
    const req = buildReq({ params });
    const res = buildRes({ locals });

    const factor = buildFactor({ user_id: user.id });
    mockUserRepository.findById.mockResolvedValue(user);
    mockFactorRepository.findByUserIdAndType.mockResolvedValue(null);
    mockCryptoService.generate2FASecret.mockReturnValue("totp_secret");
    mockFactorRepository.create.mockResolvedValue(factor);
    mockCryptoService.symmetricEncrypt.mockReturnValue("encrypted_secret");
    mockCryptoService.generateKeyUri.mockReturnValue("key_uri");
    mockCryptoService.generate2FAQRCode.mockResolvedValue("qr_code");

    await controller.handle(req, res);

    expect(mockCryptoService.generate2FASecret).toHaveBeenCalled();
    expect(mockCryptoService.symmetricEncrypt).toHaveBeenCalledWith("totp_secret", "app_secret");
    expect(mockCryptoService.generateKeyUri).toHaveBeenCalledWith("totp_secret", user.email, "Votewise");
    expect(mockCryptoService.generate2FAQRCode).toHaveBeenCalledWith("totp_secret", user.email, "Votewise");
    expect(mockFactorRepository.create).toHaveBeenCalledWith({
      userId: user.id,
      status: "UNVERIFIED",
      secret: "encrypted_secret",
      friendlyName: user.first_name,
      factorType: "TOTP"
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: factor.id,
      type: factor.factor_type,
      totp: { qr_code: "qr_code", uri: "key_uri", secret: "totp_secret" }
    });
  });
});
