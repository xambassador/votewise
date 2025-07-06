import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ZPagination } from "@votewise/schemas";

import { PaginationBuilder } from "@/lib/pagination";

type ControllerOptions = {
  feedRepository: AppContext["repositories"]["feed"];
  commentRepository: AppContext["repositories"]["comment"];
  bucketService: AppContext["bucketService"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const feedId = req.params.feedId as string;
    const commentId = req.params.commentId as string;
    const isParamsValid = typeof feedId !== "string" || typeof commentId !== "string";
    this.ctx.assert.badRequest(isParamsValid, "Invalid parameters provided");
    const schema = ZPagination.safeParse(req.query);
    this.ctx.assert.unprocessableEntity(!schema.success, "Invalid query");
    const query = schema.data!;
    const { page, limit } = query;
    const totalReplies = await this.ctx.commentRepository.reply.count(feedId, commentId);
    const repliesResult = await this.ctx.commentRepository.reply.findByParentId(feedId, commentId, page, limit);
    const replies = repliesResult.map((reply) => {
      reply.user.avatar_url = this.ctx.bucketService.generatePublicUrl(reply.user.avatar_url ?? "", "avatar");
      return reply;
    });
    const pagination = new PaginationBuilder({ limit, page, total: totalReplies }).build();
    const result = { replies, ...pagination };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type GetRepliesResponse = ExtractControllerResponse<Controller>;
