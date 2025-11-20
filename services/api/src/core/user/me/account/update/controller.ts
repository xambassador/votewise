import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZUpdateAccount } from "@votewise/schemas/user";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.plugins.requestParser.getParser(ZUpdateAccount).parseRequest(req, res);
    const _user = await this.ctx.repositories.user.getMyAccount(locals.payload.sub);
    this.ctx.assert.resourceNotFound(!_user, "User not found");
    const user = _user!;

    await this.ctx.repositories.user.update(user.id, {
      email: body.email,
      first_name: body.first_name,
      last_name: body.last_name,
      about: body.about,
      location: body.location,
      facebook_profile_url: body.facebook,
      instagram_profile_url: body.instagram,
      twitter_profile_url: body.twitter
    });

    const result = { ...body };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type UpdateAccountResponse = ExtractControllerResponse<Controller>;
