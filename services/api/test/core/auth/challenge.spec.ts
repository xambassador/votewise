import type { AppContext } from "@/context";

import { faker } from "@faker-js/faker";
import { StatusCodes } from "http-status-codes";

import { Assertions } from "@votewise/errors";

import { Controller } from "@/core/auth/mfa/challenge/controller";

import { mockChallengeRepository, mockFactorRepository } from "../../__mock__/repository";
import { buildChallenge, buildFactor, buildReq, buildRes, ip, locals } from "../../helpers";

const params = { factor_id: faker.string.uuid() };
const controller = new Controller({
  repositories: { factor: mockFactorRepository, challenge: mockChallengeRepository },
  assert: new Assertions()
} as unknown as AppContext);

describe("MFA Challenge Controller", () => {
  test("should throw factor not found", async () => {
    const req = buildReq({ params });
    const res = buildRes({ locals });
    mockFactorRepository.findById.mockResolvedValue(undefined);

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
