import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ZCommentUpdate } from "@votewise/schemas/comment";

import { getAuthenticateLocals } from "@/utils/locals";

const ZQuery = z.object({ feedId: z.string(), commentId: z.string() });

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const locals = getAuthenticateLocals(res);
    const { body } = this.ctx.plugins.requestParser.getParser(ZCommentUpdate).parseRequest(req, res);
    const currentUserId = locals.payload.sub;
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const { commentId, feedId } = validate.data!;

    const _comment = await this.ctx.repositories.comment.findById(commentId);
    this.ctx.assert.resourceNotFound(!_comment, "Comment not found");
    const comment = _comment!;

    this.ctx.assert.resourceNotFound(comment.post_id !== feedId, "Comment not found");
    this.ctx.assert.forbidden(comment.user_id !== currentUserId, "You are not allowed to update this comment");

    await this.ctx.repositories.comment.update({
      commentId,
      userId: currentUserId,
      text: body.text
    });

    const result = { id: comment.id };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type UpdateCommentResponse = ExtractControllerResponse<Controller>;
