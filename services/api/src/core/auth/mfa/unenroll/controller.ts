import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";
import type { VerifyFactorSevice } from "../verify/service";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZDisableMFA } from "@votewise/schemas/auth";

import { getAuthenticateLocals } from "@/utils/locals";

const { USER_NOT_FOUND } = ERROR_CODES.AUTH;
const USER_NOT_FOUND_MSG = "User not found";

export class Controller {
  private readonly ctx: AppContext & { verifyFactorService: VerifyFactorSevice };

  constructor(opts: AppContext & { verifyFactorService: VerifyFactorSevice }) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { payload } = locals;
    const { body } = this.ctx.plugins.requestParser.getParser(ZDisableMFA).parseRequest(req, res);
    const factorId = req.params.factor_id as string;

    const _user = await this.ctx.repositories.user.findById(payload.sub);
    if (!_user) {
      await this.ctx.services.crypto.hashPassword(body.password);
      this.ctx.assert.resourceNotFound(!_user, USER_NOT_FOUND_MSG, USER_NOT_FOUND);
    }

    const user = _user!;

    const isValid = await this.ctx.services.crypto.comparePassword(body.password, user.password);
    this.ctx.assert.badRequest(!isValid, "Invalid credentials");

    await this.ctx.verifyFactorService.verifyChallenge({
      factorId,
      challengeId: body.challenge_id,
      code: body.otp,
      userId: user.id,
      ip: locals.meta.ip
    });

    await this.ctx.repositories.factor.deleteById(factorId);

    const result = {};
    return res.status(StatusCodes.NO_CONTENT).send() as Response<typeof result>;
  }
}

export type UnEnrollMFAResponse = ExtractControllerResponse<Controller>;
