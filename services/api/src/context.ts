import type { ServerConfig, ServerSecrets } from "@/configs";
import type { TEnv } from "@votewise/lib/environment";
import type { JWTPlugin } from "./plugins/jwt";
import type { RequestParserPlugin } from "./plugins/request-parser";

import { Assertions } from "@votewise/lib/errors";
import logger from "@votewise/lib/logger";
import { prisma } from "@votewise/prisma";

import { Mailer } from "@/emails/mailer";
import { UserRepository } from "@/repository/user.repository";
import { CryptoService } from "@/services/crypto.service";
import { JWTService } from "@/services/jwt.service";
import { Cache } from "@/storage/redis";
import { checkEnv } from "@/utils";

import { jwtPluginFactory } from "./plugins/jwt";
import { requestParserPluginFactory } from "./plugins/request-parser";
import { TasksQueue } from "./queues";
import { SessionManager } from "./services/session.service";

type Repositories = {
  user: UserRepository;
};

type Queue = {
  tasksQueue: TasksQueue;
};

type Plugins = {
  requestParser: RequestParserPlugin;
  jwt: JWTPlugin;
};

export type AppContextOptions = {
  config: ServerConfig;
  secrets: ServerSecrets;
  db: typeof prisma;
  logger: typeof logger;
  environment: TEnv;
  cache: Cache;
  mailer: Mailer;
  repositories: Repositories;
  jwtService: JWTService;
  cryptoService: CryptoService;
  sessionManager: SessionManager;
  queues: Queue;
  assert: Assertions;
  plugins: Plugins;
};

export class AppContext {
  private static _instance: AppContext;

  public config: ServerConfig;
  public secrets: ServerSecrets;
  public db: typeof prisma;
  public logger: typeof logger;
  public environment: TEnv;
  public cache: Cache;
  public jwtService: JWTService;
  public repositories: Repositories;
  public mailer: Mailer;
  public cryptoService: CryptoService;
  public queues: Queue;
  public assert: Assertions;
  public sessionManager: SessionManager;
  public plugins: Plugins;

  constructor(opts: AppContextOptions) {
    this.config = opts.config;
    this.cache = opts.cache;
    this.secrets = opts.secrets;
    this.db = opts.db;
    this.logger = opts.logger;
    this.environment = opts.environment;
    this.jwtService = opts.jwtService;
    this.repositories = opts.repositories;
    this.mailer = opts.mailer;
    this.cryptoService = opts.cryptoService;
    this.queues = opts.queues;
    this.assert = opts.assert;
    this.sessionManager = opts.sessionManager;
    this.plugins = opts.plugins;
  }

  static async fromConfig(
    cfg: ServerConfig,
    secrets: ServerSecrets,
    overrides?: Partial<AppContextOptions>
  ): Promise<AppContext> {
    if (this._instance) return this._instance;
    const environment = checkEnv(process.env);
    const assert = new Assertions();
    const cache = new Cache();
    const db = prisma;
    const jwtService = new JWTService({
      accessTokenSecret: secrets.jwtSecret,
      refreshTokenSecret: secrets.jwtRefreshSecret
    });
    const cryptoService = new CryptoService();
    const userRepository = new UserRepository({ db });
    const mailer = new Mailer({ env: environment });
    const tasksQueue = new TasksQueue({ env: environment });
    const sessionManager = new SessionManager({ jwtService, cache, assert, cryptoService });
    const requestParser = requestParserPluginFactory();
    const jwtPlugin = jwtPluginFactory({ jwtService });
    const ctx = new AppContext({
      config: cfg,
      secrets,
      db,
      logger,
      environment,
      cache,
      jwtService,
      mailer,
      cryptoService,
      assert,
      sessionManager,
      repositories: {
        user: userRepository
      },
      queues: { tasksQueue },
      plugins: { requestParser, jwt: jwtPlugin },
      ...(overrides ?? {})
    });
    this._instance = ctx;
    cache.onConnect(() => {
      tasksQueue.init();
      tasksQueue.initWorker(ctx);
    });
    return ctx;
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
