import type { AppContext } from "@/context";

import { Assertions } from "@votewise/errors";
import { Minute } from "@votewise/times";

import { requestParserPluginFactory } from "@/plugins";
import { mockChallengeRepository } from "@/repository/__mock__/challenge.repository";
import { mockFactorRepository } from "@/repository/__mock__/factor.repository";
import { mockCryptoService } from "@/services/__mock__/crypto.service";
import { mockSessionManagerWithoutCtx } from "@/services/__mock__/session.service";

import { buildChallenge, buildFactor, buildReq, buildRes, getLocals } from "../../../../../../test/helpers";
import { Controller } from "../controller";

const controller = new Controller({
  assert: new Assertions(),
  requestParser: requestParserPluginFactory(),
  challengeRepository: mockChallengeRepository,
  factorRepository: mockFactorRepository,
  cryptoService: mockCryptoService,
  environment: { APP_SECRET: "app_secret" } as AppContext["environment"],
  sessionManager: mockSessionManagerWithoutCtx
});

beforeEach(() => {
  jest.clearAllMocks();
});

const ip = "192.34.24.45";
const userId = "user-id";
const body = {
  code: "123456",
  challenge_id: "challenge-id"
};
const factorId = "factor-id";
const { locals } = getLocals();

describe("Verify MFA Challenge Controller", () => {
  it("should throw error if body is invalid", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body: {} });
    const res = buildRes({ locals });

    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockFactorRepository.findById).not.toHaveBeenCalled();
    expect(error.message).toBe("code is missing");
  });

  it("should throw error if factor not found", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body });
    const res = buildRes({ locals });

    mockFactorRepository.findById.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockChallengeRepository.findById).not.toHaveBeenCalled();
    expect(mockFactorRepository.findById).toHaveBeenCalledWith(factorId);
    expect(error.message).toBe("Factor not found");

    mockFactorRepository.findById.mockResolvedValueOnce(buildFactor({ id: factorId, user_id: "another-user-id" }));

    const forbiddenError = await controller.handle(req, res).catch((err) => err);
    expect(forbiddenError.message).toBe("Factor not found");
  });

  it("should throw error if challenge not found", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body });
    const res = buildRes({ locals });

    mockFactorRepository.findById.mockResolvedValueOnce(buildFactor({ id: factorId, user_id: userId }));
    mockChallengeRepository.findById.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockChallengeRepository.findById).toHaveBeenCalledWith(body.challenge_id);
    expect(mockCryptoService.symmetricDecrypt).not.toHaveBeenCalled();
    expect(error.message).toBe("MFA factor with the provided challenge ID not found");
  });

  it("should throw error if challenge is invalid", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body });
    const res = buildRes({ locals });

    mockFactorRepository.findById.mockResolvedValueOnce(buildFactor({ id: factorId, user_id: userId }));
    mockChallengeRepository.findById.mockResolvedValue(
      buildChallenge({ id: body.challenge_id, verified_at: new Date() })
    );

    const error = await controller.handle(req, res).catch((err) => err);
    expect(mockCryptoService.symmetricDecrypt).not.toHaveBeenCalled();
    expect(error.message).toBe("Challenge and verify IP address mismatch. Try enrollment again");
  });

  it("should throw error if challenge is expired", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body });
    const res = buildRes({ locals });
    const expiredChallenge = buildChallenge({
      id: body.challenge_id,
      created_at: new Date(Date.now() - 400000),
      verified_at: null,
      ip
    });

    mockFactorRepository.findById.mockResolvedValueOnce(buildFactor({ id: factorId, user_id: userId }));
    mockChallengeRepository.findById.mockResolvedValue(expiredChallenge);

    const expiredError = await controller.handle(req, res).catch((err) => err);
    expect(mockCryptoService.symmetricDecrypt).not.toHaveBeenCalled();
    expect(expiredError.message).toBe(
      `MFA challenge ${body.challenge_id} has expired, verify against another challenge or create a new challenge.`
    );
  });

  it("should throw error if totp is invalid", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body });
    const res = buildRes({ locals });
    const challenge = buildChallenge({
      id: body.challenge_id,
      created_at: new Date(),
      verified_at: null,
      ip
    });
    const factor = buildFactor({ id: factorId, user_id: userId, secret: "encrypted" });
    mockFactorRepository.findById.mockResolvedValueOnce(factor);
    mockChallengeRepository.findById.mockResolvedValue(challenge);
    mockCryptoService.symmetricDecrypt.mockReturnValue("decrypted-secret");
    mockCryptoService.verify2FACode.mockReturnValue(false);

    const error = await controller.handle(req, res).catch((err) => err);

    expect(mockCryptoService.symmetricDecrypt).toHaveBeenCalledWith(factor.secret, "app_secret");
    expect(mockCryptoService.verify2FACode).toHaveBeenCalledWith("decrypted-secret", body.code);
    expect(error.message).toBe("Invalid TOTP code provided");
  });

  it("should successfully verify challenge", async () => {
    const req = buildReq({ params: { factor_id: factorId }, body });
    const res = buildRes({ locals });
    const challenge = buildChallenge({
      id: body.challenge_id,
      created_at: new Date(),
      verified_at: null,
      ip
    });
    const factor = buildFactor({ id: factorId, user_id: userId, secret: "encrypted" });
    mockFactorRepository.findById.mockResolvedValueOnce(factor);
    mockChallengeRepository.findById.mockResolvedValue(challenge);
    mockCryptoService.symmetricDecrypt.mockReturnValue("decrypted-secret");
    mockCryptoService.verify2FACode.mockReturnValue(true);
    mockChallengeRepository.verifyChallenge.mockResolvedValue(buildChallenge());
    mockFactorRepository.verifyFactor.mockResolvedValue({ ...factor, status: "VERIFIED" });

    const sessionData = {
      sessionId: "session-id",
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      expiresAt: Date.now() + 30 * Minute,
      expiresInMs: 30 * Minute
    };
    mockSessionManagerWithoutCtx.create.mockReturnValue(sessionData);

    await controller.handle(req, res);

    expect(mockChallengeRepository.verifyChallenge).toHaveBeenCalledWith(body.challenge_id);
    expect(mockFactorRepository.verifyFactor).toHaveBeenCalledWith(factorId);
    expect(mockSessionManagerWithoutCtx.update).toHaveBeenCalledWith("session-id", { aal: "aal2", factorId });
    expect(res.json).toHaveBeenCalledWith({
      access_token: sessionData.accessToken,
      refresh_token: sessionData.refreshToken,
      token_type: "Bearer",
      expires_in: sessionData.expiresInMs,
      expires_at: sessionData.expiresAt
    });
  });
});
