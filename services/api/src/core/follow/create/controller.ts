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
      this.ctx.assert.operationNotAllowed(user.id === currentUserId, `You cannot follow yourself.`);
      const isAlreadyFollowing = await this.ctx.repositories.follow.isFollowing(currentUserId, user.id);
      if (isAlreadyFollowing) {
        return res.status(StatusCodes.CREATED).json({ id: isAlreadyFollowing.id }) as Response<{ id: string }>;
      }
      const follow = await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
        const follow = await this.ctx.repositories.follow.create(currentUserId, user.id, tx);
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          currentUserId,
          (stats) => ({
            ...stats,
            total_following: (stats?.total_following ?? 0) + 1
          }),
          tx
        );
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          user.id,
          (stats) => ({
            ...stats,
            total_followers: (stats?.total_followers ?? 0) + 1
          }),
          tx
        );
        return follow;
      });
      return res.status(StatusCodes.CREATED).json({ id: follow.id }) as Response<{ id: string }>;
    } else {
      const _userByUsername = await this.ctx.repositories.user.findByUsername(canBeUsernameOrId);
      this.ctx.assert.resourceNotFound(
        !_userByUsername,
        `User with username "${canBeUsernameOrId}" not found.`,
        ERROR_CODES.AUTH.USER_NOT_FOUND
      );
      const userByUsername = _userByUsername!;
      this.ctx.assert.operationNotAllowed(userByUsername.id === currentUserId, `You cannot follow yourself.`);
      const isAlreadyFollowing = await this.ctx.repositories.follow.isFollowing(currentUserId, userByUsername.id);
      if (isAlreadyFollowing) {
        return res.status(StatusCodes.CREATED).json({ id: isAlreadyFollowing.id }) as Response<{ id: string }>;
      }

      const follow = await this.ctx.repositories.transactionManager.withDataLayerTransaction(async (tx) => {
        const follow = await this.ctx.repositories.follow.create(currentUserId, userByUsername.id);
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          currentUserId,
          (stats) => ({
            ...stats,
            total_following: (stats?.total_following ?? 0) + 1
          }),
          tx
        );
        await this.ctx.repositories.aggregator.userAggregator.aggregate(
          userByUsername.id,
          (stats) => ({
            ...stats,
            total_followers: (stats?.total_followers ?? 0) + 1
          }),
          tx
        );
        return follow;
      });
      return res.status(StatusCodes.CREATED).json({ id: follow.id }) as Response<{ id: string }>;
    }
  }
}

export type FollowResponse = ExtractControllerResponse<Controller>;
