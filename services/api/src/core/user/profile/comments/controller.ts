import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { unpack } from "@/lib/cursor";
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
    const limit = query.limit < 1 ? PAGINATION.comments.limit : query.limit;
    const cursor = unpack(query.cursor, () => this.ctx.assert.unprocessableEntity(true, "Invalid cursor"));

    const total = await this.ctx.repositories.user.countUserComments(username!);
    const comments = await this.ctx.repositories.user.getUserComments(username!, { page, limit, cursor });
    const nextCursor = comments.length < limit ? undefined : comments.at(-1);
    const pagination = new PaginationBuilder({
      limit,
      page,
      total,
      cursor: nextCursor ? { primary: nextCursor.created_at, secondary: nextCursor.id } : undefined
    }).build();

    const result = { comments, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetUserCommentsResponse = ExtractControllerResponse<Controller>;
