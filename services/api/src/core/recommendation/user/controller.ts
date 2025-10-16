import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZRecommendUserQuery } from "@votewise/schemas/user";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const validate = ZRecommendUserQuery.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(
      !validate.success,
      validate.error?.errors[0]?.message || "Invalid query parameters"
    );
    const q = validate.data!;
    const topN = q.top_n || 10;
    const recommendationResult = await this.ctx.services.ml.getUserRecommendations({
      user_id: locals.payload.sub,
      top_n: topN
    });
    if (!recommendationResult.success) {
      this.ctx.assert.internalServer(!recommendationResult.success, "Failed to get user recommendations");
      // This is just to make typescript happy. I don't have idea about how to type `assert` correctly
      throw new Error("Failed to get user recommendations");
    }
    const recommendations = recommendationResult.data.recommended_users;
    if (!recommendations || !recommendations.length) {
      return res.status(StatusCodes.OK).json({ users: [] });
    }

    const usersResults = await this.ctx.repositories.user.findManyByIds(recommendations);
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
        this.ctx.services.bucket
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
