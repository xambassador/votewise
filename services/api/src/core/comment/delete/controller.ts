import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  feedRepository: AppContext["repositories"]["feed"];
  commentRepository: AppContext["repositories"]["comment"];
  assert: AppContext["assert"];
};

const ZQuery = z.object({
  feedId: z.string(),
  commentId: z.string()
});

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const validate = ZQuery.safeParse(req.params);
    this.ctx.assert.unprocessableEntity(!validate.success, "Invalid request");
    const body = validate.data!;

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const _comment = await this.ctx.commentRepository.findById(body.commentId);
    this.ctx.assert.resourceNotFound(!_comment, `Comment with id ${body.commentId} not found`);
    const comment = _comment!;

    this.ctx.assert.unprocessableEntity(comment.post_id !== body.feedId, "Comment does not belong to this feed");
    this.ctx.assert.forbidden(comment.user_id !== currentUserId, "You are not allowed to delete this comment");

    await this.ctx.commentRepository.delete(comment.id);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
}

export type DeleteCommentResponse = ExtractControllerResponse<Controller>;
