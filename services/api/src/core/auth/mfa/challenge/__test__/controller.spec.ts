import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { mockChallengeRepository } from "@/repository/__mock__/challenge.repository";
import { mockFactorRepository } from "@/repository/__mock__/factor.repository";

import { buildChallenge, buildFactor, buildReq, buildRes } from "../../../../../../test/helpers";
import { Controller } from "../controller";

const ip = "192.168.2.25";
const params = { factor_id: "factor_id" };
const session = { ip, userAgent: "userAgent", aal: "aal1" };
const locals = { meta: { ip }, session };
const controller = new Controller({
  factorRepository: mockFactorRepository,
  challengeRepository: mockChallengeRepository,
  assert: new Assertions()
});

describe("MFA Challenge Controller", () => {
  test("should throw factor not found", async () => {
    const req = buildReq({ params });
    const res = buildRes({ locals });
    mockFactorRepository.findById.mockResolvedValue(null);

    const error = await controller.handle(req, res).catch((e) => e);
    expect(error.message).toBe("Factor not found with the given id");
  });

  test("should create a new challenge", async () => {
    const req = buildReq({ params });
    const res = buildRes({ locals });

    const factor = buildFactor();
    const challenge = buildChallenge();
    mockFactorRepository.findById.mockResolvedValue(factor);
    mockChallengeRepository.create.mockResolvedValue(challenge);

    await controller.handle(req, res);
    expect(mockFactorRepository.findById).toHaveBeenCalledWith(params.factor_id);
    expect(mockChallengeRepository.create).toHaveBeenCalledWith({ factor_id: factor.id, ip });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json.mock.calls[0]?.[0]).toEqual({
      id: challenge.id,
      expires_at: expect.any(Date),
      type: factor.factor_type
    });
  });
});
