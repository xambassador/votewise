import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

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
    const body = validate.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const _comment = await this.ctx.repositories.comment.findById(body.commentId);
    this.ctx.assert.resourceNotFound(!_comment, `Comment with id ${body.commentId} not found`);
    const comment = _comment!;

    this.ctx.assert.unprocessableEntity(comment.post_id !== body.feedId, "Comment does not belong to this feed");
    this.ctx.assert.forbidden(comment.user_id !== currentUserId, "You are not allowed to delete this comment");

    await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
      await this.ctx.repositories.comment.delete(comment.id, tx);

      if (!comment.parent_id) {
        await Promise.all([
          this.ctx.repositories.aggregator.postAggregator.aggregate(
            comment.post_id,
            (stats) => ({
              ...stats,
              comments: (stats?.comments ?? 1) - 1
            }),
            tx
          ),
          this.ctx.repositories.aggregator.userAggregator.aggregate(
            comment.user_id,
            (stats) => ({
              ...stats,
              total_comments: (stats?.total_comments ?? 1) - 1
            }),
            tx
          )
        ]);
      }
    });
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}

export type DeleteCommentResponse = ExtractControllerResponse<Controller>;
