import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  mlService: AppContext["mlService"];
  bucketService: AppContext["bucketService"];
  groupRepository: AppContext["repositories"]["group"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(_: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const recommendationResult = await this.ctx.mlService.getGroupRecommendations({ user_id: locals.payload.sub });
    if (!recommendationResult.success) {
      this.ctx.assert.internalServer(!recommendationResult.success, "Failed to get group recommendations");
      throw new Error("Failed to get group recommendations");
    }

    const recommendations = recommendationResult.data.recommended_groups;
    if (!recommendations || !recommendations.length) {
      return res.status(StatusCodes.OK).json({ groups: [] });
    }

    const groupsResult = await this.ctx.groupRepository.getGroupsById(recommendationResult.data.recommended_groups);
    const groupsPromises = groupsResult.map((g) => {
      const group = {
        id: g.id,
        name: g.name,
        about: g.about,
        author: g.admins[0]
      };
      return new Promise<typeof group>((resolve) => {
        this.ctx.bucketService
          .getUrlForType(group.author?.avatar_url || "", "avatar")
          .then((url) => {
            if (group.author) {
              group.author.avatar_url = url;
              resolve(group);
            } else {
              resolve(group);
            }
          })
          .catch(() => {
            resolve(group);
          });
      });
    });

    const groups = await Promise.all(groupsPromises);
    const result = { groups };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetGroupRecommendationsResponse = ExtractControllerResponse<Controller>;
