import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZOnboard } from "@votewise/schemas/onboard";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  userRepository: AppContext["repositories"]["user"];
  requestParser: AppContext["plugins"]["requestParser"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const _userId = req.params.user_id;
    this.ctx.assert.badRequest(!_userId, "User ID is missing");
    const userId = _userId!;
    this.ctx.assert.forbidden(userId !== locals.payload.sub, "Forbidden access");
    const { body } = this.ctx.requestParser.getParser(ZOnboard).parseRequest(req, res);
    const user = await this.ctx.userRepository.update(locals.payload.sub, {
      user_name: body.user_name,
      location: body.location,
      is_onboarded: true,
      first_name: body.first_name,
      last_name: body.last_name,
      gender: body.gender,
      about: body.about,
      cover_image_url: body.cover_url,
      avatar_url: body.avatar_url,
      facebook_profile_url: body.facebook_url,
      twitter_profile_url: body.twitter_url,
      instagram_profile_url: body.instagram_url
    });
    return res.status(StatusCodes.OK).json({ is_onboarded: user.is_onboarded, ...body });
  }
}
