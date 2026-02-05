import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ZPagination } from "@votewise/schemas";

import { getAuthenticateLocals } from "@/utils/locals";

const ZQuery = ZPagination.extend({ groupId: z.string() });

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const query = validate.data!;

    const _group = await this.ctx.repositories.group.findById(query.groupId);
    this.ctx.assert.resourceNotFound(!_group, `Group with id ${query.groupId} not found`);
    const group = _group!;

    const _admin = await this.ctx.repositories.group.groupMember.getAdminDetails(group.id);
    this.ctx.assert.unprocessableEntity(!_admin, "This group is no longer available");
    const admin = _admin!;

    const isMember = await this.ctx.repositories.group.groupMember.isMember(group.id, locals.payload.sub);
    let isInviteSent = false;

    if (!isMember && group.type === "PRIVATE") {
      const invite = await this.ctx.repositories.group.groupInvitation.findByUserWithGroup(
        locals.payload.sub,
        group.id
      );
      if (invite) isInviteSent = true;
    }

    const result = {
      id: group.id,
      name: group.name,
      about: group.about,
      type: group.type,
      status: group.status,
      logo_url: group.logo_url,
      cover_url: group.cover_image_url,
      created_at: group.created_at,
      updated_at: group.updated_at,
      self_is_member: isMember,
      is_invite_sent: isInviteSent,
      admin: {
        id: admin.user.id,
        username: admin.user.user_name,
        first_name: admin.user.first_name,
        last_name: admin.user.last_name,
        avatar: admin.user.avatar_url
      },
      aggregate: {
        total_members: group.groupAggregates?.total_members || 0,
        total_posts: group.groupAggregates?.total_posts || 0,
        total_votes: group.groupAggregates?.total_votes || 0,
        total_comments: group.groupAggregates?.total_comments || 0
      },
      members: group.members.map((member) => ({
        id: member.user_id,
        avatar_url: member.user.avatar_url
      }))
    };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetGroupResponse = ExtractControllerResponse<Controller>;
