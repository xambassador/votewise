import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";
import type { UserRegisterService } from "./service";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";
import { ZRegister } from "@votewise/schemas";

export type ControllerOptions = AppContext & { userRegisterService: UserRegisterService };

const { EMAIL_ALREADY_EXISTS } = ERROR_CODES.AUTH;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { body, locals } = this.ctx.plugins.requestParser.getParser(ZRegister).parseRequest(req, res);
    const ip = locals.meta.ip;

    const user = await this.ctx.repositories.user.findByEmail(body.email);
    this.ctx.assert.invalidInput(!!user, `${body.email} already exists`, EMAIL_ALREADY_EXISTS);

    const hash = await this.ctx.services.crypto.hashPassword(body.password);
    const defaultUserName = this.ctx.services.crypto.generateNanoId(20);
    const email = body.email;
    const createdUser = await this.ctx.repositories.user.create({
      email,
      password: hash,
      user_name: defaultUserName, // We will update this later in onboarding process
      first_name: "INVALID_FIRST_NAME",
      last_name: "INVALID_LAST_NAME",
      secret: this.ctx.services.crypto.generateUUID(),
      is_email_verify: false,
      is_onboarded: false,
      vote_bucket: 10
    });

    const { verificationCode, expiresIn } = await this.ctx.userRegisterService.startVerificationProcess({
      userId: createdUser.id,
      email,
      ip,
      secret: createdUser.secret
    });

    const result = {
      user_id: createdUser.id,
      verification_code: verificationCode,
      expires_in: expiresIn
    };
    return res.status(StatusCodes.CREATED).json(result) as Response<typeof result>;
  }
}

export type SignupResponse = ExtractControllerResponse<Controller>;
