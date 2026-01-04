import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const { username } = req.params;
    this.ctx.assert.unprocessableEntity(!username, "Username is required");

    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");

    const query = schema.data!;
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.groups.limit : query.limit;

    const total = await this.ctx.repositories.user.countUserGroups(username!);
    const groups = await this.ctx.repositories.user.getUserGroups(username!, { page, limit });
    const pagination = new PaginationBuilder({ limit, page, total }).build();

    const result = { groups, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserGroupsResponse = ExtractControllerResponse<Controller>;
