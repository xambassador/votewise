import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import { StatusCodes } from "http-status-codes";

import { InvalidInputError, ResourceNotFoundError } from "@votewise/lib/errors";

type QueryParams = { file_name?: string };
type Params = { token: string };
type ControllerOptions = {
  ctx: AppContext;
};

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
  }

  public async handle<P extends Params, R, B, Q extends QueryParams, L extends Record<string, unknown>>(
    req: Request<P, R, B, Q, L>,
    res: Response
  ) {
    const { token, fileName } = this.parseQueryParams(req);
    const path = this.ctx.getBlobPath(fileName, token);
    const stats = await this.getFileInfo(path);
    return res.status(StatusCodes.OK).json({ total_chunk_uploaded: stats.size });
  }

  private async getFileInfo(path: string) {
    try {
      return await this.ctx.getFileInfo(path);
    } catch (err) {
      throw new ResourceNotFoundError("No file found with provided credentials");
    }
  }

  private parseQueryParams<P extends Params, R, B, Q extends QueryParams, L extends Record<string, unknown>>(
    req: Request<P, R, B, Q, L>
  ) {
    const token = req.params.token;
    const fileName = req.query.file_name;
    if (!req.query || !token || !fileName) {
      throw new InvalidInputError("Missing required query parameters");
    }
    return { token, fileName };
  }
}
