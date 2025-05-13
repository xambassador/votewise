import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  mlService: AppContext["mlService"];
  assert: AppContext["assert"];
  bucketService: AppContext["bucketService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const recommendationResult = await this.ctx.mlService.getUserRecommendations({ user_id: locals.payload.sub });
    if (!recommendationResult.success) {
      this.ctx.assert.internalServer(!recommendationResult.success, "Failed to get user recommendations");
      // This is just to make typescript happy. I dont have idea about how to type `assert` correctly
      throw new Error("Failed to get user recommendations");
    }
    const recommendations = recommendationResult.data.recommended_users;
    if (!recommendations || !recommendations.length) {
      return res.status(StatusCodes.OK).json({ users: [] });
    }

    const usersResults = await this.ctx.userRepository.findManyByIds(recommendations);
    const usersPromises = usersResults.map((u) => {
      const user = {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        about: u.about,
        avatar_url: "",
        user_name: u.user_name
      };
      return new Promise<typeof user>((resolve) => {
        this.ctx.bucketService
          .getUrlForType(u.avatar_url || "", "avatar")
          .then((url) => {
            user.avatar_url = url;
            resolve(user);
          })
          .catch(() => {
            user.avatar_url = "";
            resolve(user);
          });
      });
    });
    const users = await Promise.all(usersPromises);
    const result = { users };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserRecommendationsResponse = ExtractControllerResponse<Controller>;
