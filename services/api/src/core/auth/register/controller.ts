import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { UserRegisterService } from "./service";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZRegister } from "@votewise/schemas";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  cryptoService: AppContext["cryptoService"];
  assert: AppContext["assert"];
  requestParser: AppContext["plugins"]["requestParser"];
  userRegisterService: UserRegisterService;
};

const { EMAIL_ALREADY_EXISTS } = ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.requestParser.getParser(ZRegister).parseRequest(req, res);
    const ip = locals.meta.ip;

    const user = await this.ctx.userRepository.findByEmail(body.email);
    this.ctx.assert.invalidInput(!!user, `${body.email} already exists`, EMAIL_ALREADY_EXISTS);

    const hash = await this.ctx.cryptoService.hashPassword(body.password);
    const defaultUserName = this.ctx.cryptoService.generateNanoId(20);
    const createdUser = await this.ctx.userRepository.create({
      email: body.email,
      password: hash,
      user_name: `user_${defaultUserName}`, // We will update this later in onboarding process
      first_name: "INVALID_FIRST_NAME",
      last_name: "INVALID_LAST_NAME"
    });

    const { verificationCode, expiresIn } = await this.ctx.userRegisterService.startVerificationProcess({
      userId: createdUser.id,
      email: body.email,
      ip,
      secret: createdUser.secret
    });

    return res.status(StatusCodes.CREATED).json({
      user_id: createdUser.id,
      verification_code: verificationCode,
      expires_in: expiresIn
    });
  }
}
