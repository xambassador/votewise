import type { AppContext } from "@/context";
import type { Request, Response } from "express";

import fs from "node:fs";
import { StatusCodes } from "http-status-codes";
import sanitize from "sanitize-filename";
import { v4 } from "uuid";

import { ZHandshake } from "@votewise/schemas";

type ControllerOptions = {
  ctx: AppContext;
};

export class Controller {
  private readonly ctx: AppContext;

  constructor(opts: ControllerOptions) {
    this.ctx = opts.ctx;
  }

  public async handle(req: Request, res: Response) {
    const { body } = this.ctx.plugins.requestParser.getParser(ZHandshake).parseRequest(req);
    const fileName = sanitize(body.file_name);
    const fileToken = v4().replace(/-/g, "");
    const filePath = this.ctx.getBlobPath(fileName, fileToken);
    fs.createWriteStream(filePath, { flags: "w" });
    return res.status(StatusCodes.OK).json({ file_token: fileToken });
  }
}
