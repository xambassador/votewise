import type { AppContext } from "@/context";
import type { THandshake } from "@votewise/schemas";

import fs from "node:fs";
import { v4 } from "uuid";

export class Service {
  private readonly ctx: AppContext;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
  }

  public async execute(data: THandshake) {
    const fileName = data.file_name;
    const fileToken = v4();
    const filePath = this.ctx.getBlobPath(fileName, fileToken);
    fs.createWriteStream(filePath, { flags: "w" });
    return { file_token: fileToken };
  }
}
