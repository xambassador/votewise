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
    const locals = getAuthenticateLocals(res);
    const currentUserId = locals.payload.sub;
    const canBeUsernameOrId = req.params.id as string;
    this.ctx.assert.invalidInput(
      typeof canBeUsernameOrId !== "string",
      "Invalid parameter provided. Expected a string."
    );

    const user = await this.ctx.repositories.user.findById(canBeUsernameOrId);
    if (user) {
      this.ctx.assert.operationNotAllowed(user.id === currentUserId, `You cannot unfollow yourself.`);
      const follow = await this.ctx.repositories.follow.getFollow(currentUserId, user.id);
      if (!follow) {
        return res.status(StatusCodes.NO_CONTENT).send() as Response<void>;
      }
      await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
        await this.ctx.repositories.follow.delete(follow.id, tx);
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          currentUserId,
          (stats) => ({
            ...stats,
            total_following: (stats?.total_following ?? 1) - 1
          }),
          tx
        );
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          user.id,
          (stats) => ({
            ...stats,
            total_followers: (stats?.total_followers ?? 1) - 1
          }),
          tx
        );
      });
      return res.status(StatusCodes.NO_CONTENT).send() as Response<void>;
    } else {
      const _userByUsername = await this.ctx.repositories.user.findByUsername(canBeUsernameOrId);
      this.ctx.assert.resourceNotFound(
        !_userByUsername,
        `User with username "${canBeUsernameOrId}" not found.`,
        ERROR_CODES.AUTH.USER_NOT_FOUND
      );
      const userByUsername = _userByUsername!;
      this.ctx.assert.operationNotAllowed(userByUsername.id === currentUserId, `You cannot unfollow yourself.`);
      const follow = await this.ctx.repositories.follow.getFollow(currentUserId, userByUsername.id);
      if (!follow) {
        return res.status(StatusCodes.NO_CONTENT).send() as Response<void>;
      }
      await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
        await this.ctx.repositories.follow.delete(follow.id);
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          currentUserId,
          (stats) => ({
            ...stats,
            total_following: (stats?.total_following ?? 1) - 1
          }),
          tx
        );
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          userByUsername.id,
          (stats) => ({
            ...stats,
            total_followers: (stats?.total_followers ?? 1) - 1
          }),
          tx
        );
      });
      return res.status(StatusCodes.NO_CONTENT).send() as Response<void>;
    }
  }
}

export type UnFollowResponse = ExtractControllerResponse<Controller>;
