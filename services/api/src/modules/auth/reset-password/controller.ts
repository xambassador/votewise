import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { Filters } from "./filter";

import { StatusCodes } from "http-status-codes";

type ControllerOptions = {
  filters: Filters;
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const { body, query, locals } = this.ctx.filters.parseRequest(req, res);
    const { password, email: unsafeEmail } = body;
    const { token } = query;
    const { ip } = locals.meta;

    const _userFromUnsafeEmail = await this.ctx.userRepository.findByEmail(unsafeEmail);
    this.ctx.assert.resourceNotFound(!_userFromUnsafeEmail, `User with email ${unsafeEmail} not found`);
    const userFromUnsafeEmail = _userFromUnsafeEmail!;

    const decoded = this.ctx.jwtService.verifyRid(token, userFromUnsafeEmail.secret);
    if (!decoded.success) {
      return this.ctx.assert.badRequest(true, "Invalid token");
    }

    const { email, verification_code } = decoded.data;
    this.ctx.assert.badRequest(email !== unsafeEmail, "Invalid email");

    const user = userFromUnsafeEmail!;

    const hash = this.ctx.cryptoService.hash(`${user.id}:${ip}`);
    this.ctx.assert.badRequest(hash !== verification_code, "Invalid verification code");

    const hashedPassword = await this.ctx.cryptoService.hashPassword(password);
    await this.ctx.userRepository.update(user.id, {
      password: hashedPassword,
      secret: this.ctx.cryptoService.generateUUID()
    });

    return res.status(StatusCodes.OK).json({ message: "Password updated successfully" });
  }
}
