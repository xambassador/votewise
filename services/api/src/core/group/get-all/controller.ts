import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["bucketService"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const query = schema.data!;
    const total = await this.ctx.groupRepository.count();
    const { page, limit } = query;
    const _groups = await this.ctx.groupRepository.getAll({ page, limit });
    const groups = _groups.map((group) => {
      const g = {
        id: group.id,
        name: group.name,
        type: group.type,
        status: group.status,
        members: group.members.map((member) => ({
          member_id: member.id,
          role: member.role,
          id: member.user.id,
          first_name: member.user.first_name,
          user_name: member.user.user_name,
          last_name: member.user.last_name,
          avatar_url: this.ctx.bucketService.generatePublicUrl(member.user.avatar_url || "", "avatar")
        })),
        total_members: group._count.members,
        created_at: group.created_at,
        updated_at: group.updated_at
      };
      return g;
    });
    const pagination = new PaginationBuilder({ limit, page, total }).build();
    const result = { groups, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllGroupsResponse = ExtractControllerResponse<Controller>;
