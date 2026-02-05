import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { PAGINATION } from "@votewise/constant";
import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

const defaultReplyPage = 1;
const repliesLimit = PAGINATION.comments.reply.limit;

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const feedId = req.params.feedId as string;
    this.ctx.assert.badRequest(typeof feedId !== "string", "Invalid feed ID provided");
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const query = schema.data!;
    const { page } = query;
    const limit = query.limit < 1 ? PAGINATION.comments.limit : query.limit;
    const [totalComments, comments] = await Promise.all([
      this.ctx.repositories.comment.count(feedId),
      this.ctx.repositories.comment.findByFeedId(feedId, page, limit)
    ]);
    const commentsWithMetadata = comments.map((c) => {
      const isEdited = c.created_at.getTime() !== c.updated_at.getTime();
      const comment = {
        id: c.id,
        text: c.text,
        created_at: c.created_at,
        updated_at: c.updated_at,
        user: c.user,
        replies: c.replies,
        is_edited: isEdited
      };
      const totalReplies = c._count.replies;
      const pagination = new PaginationBuilder({
        limit: repliesLimit,
        page: defaultReplyPage,
        total: totalReplies
      }).build();
      return {
        ...comment,
        ...pagination
      };
    });
    const pagination = new PaginationBuilder({ limit, page, total: totalComments }).build();
    const result = { comments: commentsWithMetadata, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetCommentsResponse = ExtractControllerResponse<Controller>;
