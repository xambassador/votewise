import type { AppContext } from "@/context";
import type { ExtractControllerResponse } from "@/types";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

import { getAuthenticateLocals } from "@/utils/locals";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  followRepository: AppContext["repositories"]["follow"];
  assert: AppContext["assert"];
};

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
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

    const user = await this.ctx.userRepository.findById(canBeUsernameOrId);
    if (user) {
      this.ctx.assert.operationNotAllowed(user.id === currentUserId, `You cannot follow yourself.`);
      const isAlreadyFollowing = await this.ctx.followRepository.isFollowing(currentUserId, user.id);
      this.ctx.assert.operationNotAllowed(isAlreadyFollowing, `You are already following this user.`);
      const follow = await this.ctx.followRepository.create(currentUserId, user.id);
      return res.status(StatusCodes.CREATED).json({ id: follow.id }) as Response<{ id: string }>;
    } else {
      const _userByUsername = await this.ctx.userRepository.findByUsername(canBeUsernameOrId);
      this.ctx.assert.resourceNotFound(
        !_userByUsername,
        `User with username "${canBeUsernameOrId}" not found.`,
        ERROR_CODES.AUTH.USER_NOT_FOUND
      );
      const userByUsername = _userByUsername!;
      this.ctx.assert.operationNotAllowed(userByUsername.id === currentUserId, `You cannot follow yourself.`);
      const isAlreadyFollowing = await this.ctx.followRepository.isFollowing(currentUserId, userByUsername.id);
      this.ctx.assert.operationNotAllowed(isAlreadyFollowing, `You are already following this user.`);
      const follow = await this.ctx.followRepository.create(currentUserId, userByUsername.id);
      return res.status(StatusCodes.CREATED).json({ id: follow.id }) as Response<{ id: string }>;
    }
  }
}

export type FollowResponse = ExtractControllerResponse<Controller>;
