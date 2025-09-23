import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";
import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  assert: AppContext["assert"];
  groupRepository: AppContext["repositories"]["group"];
  bucketService: AppContext["services"]["bucket"];
};

type Group = Awaited<ReturnType<ControllerOptions["groupRepository"]["getByUserId"]>>[0];
type GroupWithAdmin = Group & {
  admin: { id: string; first_name: string; user_name: string; last_name: string; avatar_url: string };
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { sub } = locals.payload;
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const query = schema.data!;
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.groups.limit : query.limit;
    const total = await this.ctx.groupRepository.getCountByUserId(sub);
    const _groups = await this.ctx.groupRepository.getByUserId(sub, { page, limit });
    const groupWithAdmins: GroupWithAdmin[] = [];
    for (const group of _groups) {
      const admin = await this.ctx.groupRepository.groupMember.getAdminDetails(group.id);
      if (admin) {
        groupWithAdmins.push({
          ...group,
          admin: {
            id: admin.user.id,
            first_name: admin.user.first_name,
            user_name: admin.user.user_name,
            last_name: admin.user.last_name,
            avatar_url: this.ctx.bucketService.generatePublicUrl(admin.user.avatar_url || "", "avatar")
          }
        });
      }
    }
    const groups = groupWithAdmins.map((group) => ({
      id: group.id,
      name: group.name,
      about: group.about,
      type: group.type,
      status: group.status,
      admin: group.admin,
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

export type GetMyGroupsResponse = ExtractControllerResponse<Controller>;
