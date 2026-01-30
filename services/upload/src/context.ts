import type { ServerConfig } from "@/config";
import type { ImageConfigComplete } from "./core/image-optimizer";
import type { RequestParserPlugin } from "./plugins/request-parser";

import _fs from "node:fs/promises";
import path from "node:path";
import { yellow } from "chalk";
import { ensureDirSync } from "fs-extra";

import { Assertions } from "@votewise/errors";
import { JWT } from "@votewise/jwt";
import logger from "@votewise/log";

import { checkEnv } from "@/env";

import { createImageConfigDefault, ImageOptimizerCache } from "./core/image-optimizer";
import { requestParserPluginFactory } from "./plugins/request-parser";

type Plugins = {
  requestParser: RequestParserPlugin;
};
export type AppContextOptions = {
  config: ServerConfig;
  logger: typeof logger;
  environment: Environment;
  assert: Assertions;
  plugins: Plugins;
  jwtService: JWT;
  imageConfig: ImageConfigComplete;
  imageOptimizerCache: ImageOptimizerCache;
};

const baseUploadPath = path.join(__dirname, "../public/uploads");

function getFileName(fileName: string, fileToken: string) {
  return `votewise-assets-${fileToken}-${fileName}`;
}

function getBlobPath(fileName: string, fileToken: string) {
  const filePath = path.join(baseUploadPath, getFileName(fileName, fileToken));
  return filePath;
}

function createUploadPath() {
  ensureDirSync(baseUploadPath);
}

function getFileInfo(filePath: string) {
  return _fs.stat(filePath);
}

export class AppContext {
  private static _instance: AppContext;
  public config: ServerConfig;
  public logger: typeof logger;
  public environment: Environment;
  public assert: Assertions;
  public getBlobPath = getBlobPath;
  public getFileInfo = getFileInfo;
  public getFileName = getFileName;
  public plugins: Plugins;
  public jwtService: JWT;
  public imageConfig: ImageConfigComplete;
  public imageOptimizerCache: ImageOptimizerCache;

  constructor(opts: AppContextOptions) {
    this.config = opts.config;
    this.environment = opts.environment;
    this.logger = opts.logger;
    this.assert = opts.assert;
    this.plugins = opts.plugins;
    this.jwtService = opts.jwtService;
    this.imageConfig = opts.imageConfig;
    this.imageOptimizerCache = opts.imageOptimizerCache;
    createUploadPath();

    this.logger.info(`[${yellow("AppContext")}] dependencies initialized`);
  }

  static async fromConfig(cfg: ServerConfig, overrides?: Partial<AppContextOptions>): Promise<AppContext> {
    if (this._instance) return this._instance;
    const environment = checkEnv(process.env);
    const assert = new Assertions();
    const requestParser = requestParserPluginFactory();
    const jwtService = new JWT({ accessTokenSecret: environment.ACCESS_TOKEN_SECRET });
    const imageConfig = createImageConfigDefault(cfg.imageCacheTTL);
    const imageOptimizerCache = new ImageOptimizerCache({
      uploadsDir: baseUploadPath,
      config: imageConfig
    });
    const context = new AppContext({
      config: cfg,
      logger,
      environment,
      assert,
      imageConfig,
      imageOptimizerCache,
      plugins: { requestParser },
      jwtService,
      ...overrides
    });
    this._instance = context;
    return context;
  }

  static get instance(): AppContext {
    if (!this._instance) throw new Error("AppContext is not initialized");
    return this._instance;
  }

  static getInjectionTokens<T extends keyof AppContext>(keys: T[]): Pick<AppContext, T> {
    return keys.reduce(
      (acc, key) => {
        acc[key] = this.instance[key];
        return acc;
      },
      {} as Pick<AppContext, T>
    );
  }
}
