import type { ServerConfig } from "@/config";
import type { TEnv } from "@votewise/lib/environment";
import type { RequestParserPlugin } from "./plugins/request-parser";

import _fs from "node:fs/promises";
import path from "node:path";
import { ensureDirSync } from "fs-extra";

import { Assertions } from "@votewise/lib/errors";
import logger from "@votewise/lib/logger";

import { checkEnv } from "@/env";

import { requestParserPluginFactory } from "./plugins/request-parser";

type Plugins = {
  requestParser: RequestParserPlugin;
};

export type AppContextOptions = {
  config: ServerConfig;
  logger: typeof logger;
  environment: TEnv;
  assert: Assertions;
  plugins: Plugins;
};

const basUploadPath = path.join(__dirname, "../public/uploads");

function getFileName(fileName: string, fileToken: string) {
  return `votewise-assets-${fileToken}-${fileName}`;
}

function getBlobPath(fileName: string, fileToken: string) {
  const filePath = path.join(basUploadPath, getFileName(fileName, fileToken));
  return filePath;
}

function createUploadPath() {
  ensureDirSync(basUploadPath);
}

function getFileInfo(filePath: string) {
  return _fs.stat(filePath);
}

export class AppContext {
  public config: ServerConfig;
  public logger: typeof logger;
  public environment: TEnv;
  public assert: Assertions;
  public getBlobPath = getBlobPath;
  public getFileInfo = getFileInfo;
  public getFileName = getFileName;
  public plugins: Plugins;

  constructor(opts: AppContextOptions) {
    this.config = opts.config;
    this.environment = opts.environment;
    this.logger = opts.logger;
    this.assert = opts.assert;
    this.plugins = opts.plugins;
    createUploadPath();
  }

  static async fromConfig(cfg: ServerConfig, overrides?: Partial<AppContextOptions>): Promise<AppContext> {
    const environment = checkEnv(process.env);
    const assert = new Assertions();
    const requestParser = requestParserPluginFactory();
    const context = new AppContext({
      config: cfg,
      logger,
      environment,
      assert,
      plugins: { requestParser },
      ...overrides
    });
    return context;
  }
}
