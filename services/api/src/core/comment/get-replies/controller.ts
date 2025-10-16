import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

const ZQuery = z.object({
  feedId: z.string(),
  commentId: z.string()
});

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const { feedId, commentId } = validate.data!;
    const query = schema.data!;
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.comments.reply.limit : query.limit;
    const [totalReplies, repliesResult] = await Promise.all([
      this.ctx.repositories.comment.reply.count(feedId, commentId),
      this.ctx.repositories.comment.reply.findByParentId(feedId, commentId, page, limit)
    ]);
    const replies = repliesResult.map((reply) => {
      reply.user.avatar_url = this.ctx.services.bucket.generatePublicUrl(reply.user.avatar_url ?? "", "avatar");
      return reply;
    });
    const pagination = new PaginationBuilder({ limit, page, total: totalReplies }).build();
    const result = { replies, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetRepliesResponse = ExtractControllerResponse<Controller>;
