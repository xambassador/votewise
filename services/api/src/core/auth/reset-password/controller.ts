import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZResetPassword, ZResetPasswordQuery } from "@votewise/schemas";

type ControllerOptions = {
  jwtService: AppContext["jwtService"];
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
  requestParser: AppContext["plugins"]["requestParser"];
};

const { USER_NOT_FOUND, INVALID_TOKEN, INVALID_EMAIL, INVALID_VERIFICATION_CODE } = ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const parser = this.ctx.requestParser.getParser(ZResetPassword, ZResetPasswordQuery);
    const { body, query, locals } = parser.parseRequest(req, res);
    const { password, email: unsafeEmail } = body;
    const { token } = query;
    const { ip } = locals.meta;

    const _userFromUnsafeEmail = await this.ctx.userRepository.findByEmail(unsafeEmail);
    this.ctx.assert.resourceNotFound(!_userFromUnsafeEmail, `User with email ${unsafeEmail} not found`, USER_NOT_FOUND);
    const userFromUnsafeEmail = _userFromUnsafeEmail!;

    const decoded = this.ctx.jwtService.verifyRid(token, userFromUnsafeEmail.secret);
    if (!decoded.success) {
      return this.ctx.assert.badRequest(true, "Invalid token", INVALID_TOKEN);
    }

    const { email, verification_code } = decoded.data;
    this.ctx.assert.badRequest(email !== unsafeEmail, "Invalid email", INVALID_EMAIL);

    const user = userFromUnsafeEmail!;

    const hash = this.ctx.cryptoService.hash(`${user.id}:${ip}`);
    this.ctx.assert.badRequest(hash !== verification_code, "Invalid verification code", INVALID_VERIFICATION_CODE);

    const hashedPassword = await this.ctx.cryptoService.hashPassword(password);
    await this.ctx.userRepository.update(user.id, {
      password: hashedPassword,
      secret: this.ctx.cryptoService.generateUUID()
    });

    return res.status(StatusCodes.OK).json({ message: "Password updated successfully" });
  }
}
