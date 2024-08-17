import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Filters } from "./filter";

import { StatusCodes } from "http-status-codes";

import { parseIp } from "@/lib/ip";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  cache: AppContext["cache"];
  filters: Filters;
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const { body } = this.ctx.filters.parseRequest(req);
    const ipAddress = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    this.ctx.assert.invalidInput(!ipAddress, "Looks like you are behind a proxy or VPN");

    const _session = await this.ctx.cache.get(body.verification_code);
    this.ctx.assert.invalidInput(!_session, "Invalid verification_code");

    const session = JSON.parse(_session!) as { userId: string; otp: number; ip: string };

    const ip = parseIp(ipAddress!);
    this.ctx.assert.invalidInput(!(session.ip === ip), "Invalid request");
    this.ctx.assert.invalidInput(!(session.userId === body.user_id), "Invalid user_id");
    this.ctx.assert.invalidInput(!(session.otp === body.otp), "Invalid otp");

    const _user = await this.ctx.userRepository.findById(body.user_id);
    this.ctx.assert.resourceNotFound(!_user, `User with id ${body.user_id} not found`);

    const user = _user!;
    this.ctx.assert.invalidInput(user.email !== body.email, "Invalid email");
    this.ctx.assert.invalidInput(user.is_email_verify, "Email is already verified");

    await this.ctx.cache.del(body.verification_code);
    await this.ctx.userRepository.update(body.user_id, { is_email_verify: true });

    return res.status(StatusCodes.OK).json({ user_id: user.id, email: user.email, is_email_verify: true });
  }
}
