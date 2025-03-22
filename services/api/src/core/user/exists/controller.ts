import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { ERROR_CODES } from "@votewise/constant";

type ControllerOptions = {
  userRepository: AppContext["repositories"]["user"];
  assert: AppContext["assert"];
};

const { USERNAME_ALREADY_EXISTS } = ERROR_CODES.USER;

export class Controller {
  private readonly ctx: ControllerOptions;

  constructor(opts: ControllerOptions) {
    this.ctx = opts;
  }

  async handle(req: Request, res: Response) {
    const _username = req.params.username;
    this.ctx.assert.badRequest(!_username, "Username is required");
    const username = _username!;
    const user = await this.ctx.userRepository.findByUsername(username);
    this.ctx.assert.badRequest(!!user, "Username already exists", USERNAME_ALREADY_EXISTS);
    return res.status(StatusCodes.OK).json({ is_available: true });
  }
}
