import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  challengeRepository: AppContext["repositories"]["challenge"];
  factorRepository: AppContext["repositories"]["factor"];
  assert: AppContext["assert"];
};

const { FACTOR_NOT_FOUND } = ERROR_CODES["2FA"];

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { meta } = locals;
    const params = req.params as { factor_id: string };

    const _factor = await this.ctx.factorRepository.findById(params.factor_id);
    this.ctx.assert.resourceNotFound(!_factor, "Factor not found with the given id", FACTOR_NOT_FOUND);

    const factor = _factor!;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    const challenge = await this.ctx.challengeRepository.create({ factor_id: factor.id, ip: meta.ip });
    return res.status(StatusCodes.OK).json({ id: challenge.id, expires_at: expiresAt, type: factor.factor_type });
  }
}
