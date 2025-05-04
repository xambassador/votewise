import type { ServerConfig } from "@/config";
import type { RequestParserPlugin } from "./plugins/request-parser";

import _fs from "node:fs/promises";
import path from "node:path";
import { yellow } from "chalk";
import { ensureDirSync } from "fs-extra";
import * as Minio from "minio";

import { Assertions } from "@votewise/errors";
import { JWT } from "@votewise/jwt";
import logger from "@votewise/log";

import { checkEnv } from "@/env";
import { UploadCompletedEventQueue, UploadQueue } from "@/queues";
import { RedisAdapter } from "@/storage/redis";

import { requestParserPluginFactory } from "./plugins/request-parser";

type Plugins = {
  requestParser: RequestParserPlugin;
};
type Queue = { uploadQueue: UploadQueue; uploadCompletedEventQueue: UploadCompletedEventQueue };
export type AppContextOptions = {
  config: ServerConfig;
  logger: typeof logger;
  environment: Environment;
  assert: Assertions;
  plugins: Plugins;
  minio: Minio.Client;
  jwtService: JWT;
  queues: Queue;
  cache: RedisAdapter;
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
  private static _instance: AppContext;
  public config: ServerConfig;
  public logger: typeof logger;
  public environment: Environment;
  public assert: Assertions;
  public getBlobPath = getBlobPath;
  public getFileInfo = getFileInfo;
  public getFileName = getFileName;
  public plugins: Plugins;
  public minio: Minio.Client;
  public jwtService: JWT;
  public queues: Queue;
  public cache: RedisAdapter;

  constructor(opts: AppContextOptions) {
    this.config = opts.config;
    this.environment = opts.environment;
    this.logger = opts.logger;
    this.assert = opts.assert;
    this.plugins = opts.plugins;
    this.minio = opts.minio;
    this.jwtService = opts.jwtService;
    this.queues = opts.queues;
    this.cache = opts.cache;
    createUploadPath();

    this.logger.info(`[${yellow("AppContext")}] dependencies initialized`);
  }

  static async fromConfig(cfg: ServerConfig, overrides?: Partial<AppContextOptions>): Promise<AppContext> {
    if (this._instance) return this._instance;
    const environment = checkEnv(process.env);
    const assert = new Assertions();
    const cache = new RedisAdapter({ environment, maxRetriesPerRequest: null });
    cache.init();
    const requestParser = requestParserPluginFactory();
    const minio = new Minio.Client({
      endPoint: environment.MINIO_ENDPOINT,
      port: environment.MINIO_PORT,
      useSSL: false, // TODO: Get this from env
      accessKey: environment.MINIO_ACCESS_KEY,
      secretKey: environment.MINIO_SECRET_KEY
    });
    const jwtService = new JWT({ accessTokenSecret: environment.ACCESS_TOKEN_SECRET });
    const uploadQueue = new UploadQueue();
    const uploadCompletedEventQueue = new UploadCompletedEventQueue();
    const context = new AppContext({
      config: cfg,
      logger,
      environment,
      assert,
      plugins: { requestParser },
      minio,
      jwtService,
      queues: { uploadQueue, uploadCompletedEventQueue },
      cache,
      ...overrides
    });
    this._instance = context;
    cache.onConnect(() => {
      uploadCompletedEventQueue.init();
      uploadQueue.init();
      uploadQueue.initWorker(context);
    });
    return context;
  }

  static get instance(): AppContext {
    if (!this._instance) throw new Error("AppContext is not initialized");
    return this._instance;
  }

  static getInjectionToken<T extends keyof AppContext>(key: T): AppContext[T] {
    return this.instance[key];
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
