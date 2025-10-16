import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: AppContext) {
    this.ctx = opts;
  }

  public async handle(req: Request, res: Response) {
    const id = req.params.id as string;
    this.ctx.assert.badRequest(typeof id !== "string", "Invalid request");

    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;

    const _feed = await this.ctx.repositories.feed.findById(id);
    this.ctx.assert.resourceNotFound(!_feed, `Feed with id ${id} not found`, ERROR_CODES.FEED.FEED_NOT_FOUND);
    const feed = _feed!;

    const isVotedByMe = await this.ctx.repositories.feed.isVoted(currentUserId, feed.id);
    this.ctx.assert.unprocessableEntity(!!isVotedByMe, "You have already voted on this feed");

    const remainingVotes = await this.ctx.repositories.user.getRemainingVotes(currentUserId);
    this.ctx.assert.unprocessableEntity(remainingVotes <= 0, "You have no votes left for today");

    await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
      await Promise.all([
        this.ctx.repositories.feed.vote(currentUserId, feed.id, tx),
        this.ctx.repositories.user.update(currentUserId, { vote_bucket: remainingVotes - 1 }, tx),
        this.ctx.repositories.aggregator.postAggregator.aggregate(
          id,
          (currentStats) => ({
            ...currentStats,
            votes: (currentStats?.votes ?? 0) + 1
          }),
          tx
        ),
        this.ctx.repositories.aggregator.userAggregator.aggregate(
          currentUserId,
          (currentStats) => ({
            ...currentStats,
            total_votes: (currentStats?.total_votes ?? 0) + 1
          }),
          tx
        )
      ]);
    });

    const result = { message: "Ok" };
    return res.status(StatusCodes.OK).json(result) as Response<typeof result>;
  }
}

export type VoteResponse = ExtractControllerResponse<Controller>;
