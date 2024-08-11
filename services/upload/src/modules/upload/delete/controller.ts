import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import fs from "node:fs/promises";

import { InvalidInputError, ResourceNotFoundError } from "@votewise/lib/errors";

type ControllerOptions = {
  ctx: AppContext;
};
type Params = { token: string };
type QueryParams = { file_name?: string };

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
    await this.deleteFile(path);
    return res.status(200).json({ message: "File deleted successfully" });
  }

  private async deleteFile(path: string) {
    try {
      await this.ctx.getFileInfo(path);
      await fs.unlink(path);
    } catch (err) {
      throw new ResourceNotFoundError("File not found");
    }
  }

  private parseQueryParams<P extends Params, R, B, Q extends QueryParams, L extends Record<string, unknown>>(
    req: Request<P, R, B, Q, L>
  ) {
    const token = req.params.token;
    const fileName = req.query.file_name;
    if (!token || !fileName) {
      throw new InvalidInputError("Missing required parameters");
    }
    return { token, fileName };
  }
}
