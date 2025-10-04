import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["services"]["bucket"];
};

const ZQuery = ZPagination.extend({
  status: z
    .enum(["CLOSED", "OPEN", "INACTIVE"], {
      invalid_type_error: "Status must be one of CLOSED, OPEN, or INACTIVE",
      message: "Status must be one of CLOSED, OPEN, or INACTIVE"
    })
    .optional()
    .default("OPEN")
});

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const schema = ZQuery.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, schema.error?.errors[0]?.message || "Invalid query");
    const query = schema.data!;
    const total = await this.ctx.groupRepository.count({ status: query.status });
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.groups.limit : query.limit;
    const _groups = await this.ctx.groupRepository.getAll({ page, limit, status: query.status });
    const groups = _groups.map((group) => ({
      id: group.id,
      name: group.name,
      about: group.about,
      type: group.type,
      status: group.status,
      logo_url: group.logo_url,
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
    }));
    const pagination = new PaginationBuilder({ limit, page, total }).build();
    const result = { groups, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetAllGroupsResponse = ExtractControllerResponse<Controller>;
