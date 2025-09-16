import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ZPagination } from "@votewise/schemas";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["services"]["bucket"];
};

const ZQuery = ZPagination.extend({ groupId: z.string() });

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const query = validate.data!;
    const _group = await this.ctx.groupRepository.findById(query.groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${query.groupId} not found`);
    const group = _group!;

    const _admin = await this.ctx.groupRepository.groupMember.getAdminDetails(group.id);
    this.ctx.assert.unprocessableEntity(!_admin, "This group is no longer available");
    const admin = _admin!;

    const result = {
      id: group.id,
      name: group.name,
      about: group.about,
      type: group.type,
      status: group.status,
      logo_url: this.ctx.bucketService.generatePublicUrl(group.logo_url ?? "", "avatar"),
      cover_url: this.ctx.bucketService.generatePublicUrl(group.cover_image_url ?? "", "background"),
      created_at: group.created_at,
      updated_at: group.updated_at,
      admin: {
        id: admin.id,
        username: admin.user.user_name,
        first_name: admin.user.first_name,
        last_name: admin.user.last_name,
        avatar: this.ctx.bucketService.generatePublicUrl(admin.user.avatar_url || "", "avatar")
      },
      aggregate: {
        total_members: group.groupAggregates?.total_members || 0,
        total_posts: group.groupAggregates?.total_posts || 0,
        total_votes: group.groupAggregates?.total_votes || 0,
        total_comments: group.groupAggregates?.total_comments || 0
      },
      members: group.members.map((member) => ({
        id: member.user_id,
        avatar_url: this.ctx.bucketService.generatePublicUrl(member.user.avatar_url || "", "avatar")
      }))
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetGroupResponse = ExtractControllerResponse<Controller>;
