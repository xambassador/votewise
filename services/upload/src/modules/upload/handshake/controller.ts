import type { AppContext } from "@/context";
import type { Request, Response } from "express";
import type { HandshakeFilters } from "./filter";

import fs from "node:fs";
import { StatusCodes } from "http-status-codes";
import { v4 } from "uuid";

type ControllerOptions = {
  ctx: AppContext;
  filters: HandshakeFilters;
};

export class Controller {
  private readonly ctx: AppContext;
  private readonly filters: HandshakeFilters;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
    this.filters = opts.filters;
  }

  public async handle<P, R, B, Q, L extends Record<string, unknown>>(req: Request<P, R, B, Q, L>, res: Response) {
    const { body } = this.filters.parseRequest(req);
    const fileName = body.file_name;
    const fileToken = v4();
    const filePath = this.ctx.getBlobPath(fileName, fileToken);
    fs.createWriteStream(filePath, { flags: "w" });
    return res.status(StatusCodes.OK).json({ file_token: fileToken });
  }
}
