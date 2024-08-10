import type { ServerConfig, ServerSecrets } from "@/configs";
import type { TEnv } from "@votewise/lib/environment";

import { Cache } from "@/storage/redis";
import { StatusCodes } from "http-status-codes";

import logger from "@votewise/lib/logger";
import { prisma } from "@votewise/prisma";

import { UserRepository } from "@/repository/user.repository";

import { CryptoService } from "@/services/crypto.service";
import { JWTService } from "@/services/jwt.service";

import { checkEnv } from "@/utils";

import { Mailer } from "@/emails/mailer";

type Repositories = {
  user: UserRepository;
};

export type AppContextOptions = {
  config: ServerConfig;
  secrets: ServerSecrets;
  db: typeof prisma;
  logger: typeof logger;
  environment: TEnv;
  cache: Cache;
  httpStatusCodes?: typeof StatusCodes;
  mailer: Mailer;
  repositories: Repositories;
  jwtSerivce: JWTService;
  cryptoService: CryptoService;
};

export class AppContext {
  private static _instance: AppContext;

  public config: ServerConfig;
  public secrets: ServerSecrets;
  public db: typeof prisma;
  public logger: typeof logger;
  public environment: TEnv;
  public cache: Cache;
  public httpStatusCodes: typeof StatusCodes;
  public jwtService: JWTService;
  public repositories: Repositories;
  public mailer: Mailer;
  public cryptoService: CryptoService;

  constructor(opts: AppContextOptions) {
    this.config = opts.config;
    this.cache = opts.cache;
    this.secrets = opts.secrets;
    this.db = opts.db;
    this.logger = opts.logger;
    this.environment = opts.environment;
    this.httpStatusCodes = opts.httpStatusCodes ?? StatusCodes;
    this.jwtService = opts.jwtSerivce;
    this.repositories = opts.repositories;
    this.mailer = opts.mailer;
    this.cryptoService = opts.cryptoService;
  }

  static async fromConfig(
    cfg: ServerConfig,
    secrets: ServerSecrets,
    overrides?: Partial<AppContextOptions>
  ): Promise<AppContext> {
    if (this._instance) {
      return this._instance;
    }
    const environment = checkEnv(process.env);
    const cache = new Cache();
    const db = prisma;
    const jwtSerivce = new JWTService({
      accessTokenSecret: secrets.jwtSecret,
      refreshTokenSecret: secrets.jwtRefreshSecret
    });
    const cryptoService = new CryptoService();
    const userRepository = new UserRepository({ db });
    const mailer = new Mailer({ env: environment });
    const ctx = new AppContext({
      config: cfg,
      secrets,
      db,
      logger,
      environment,
      cache,
      jwtSerivce,
      mailer,
      cryptoService,
      repositories: {
        user: userRepository
      },
      ...(overrides ?? {})
    });
    this._instance = ctx;
    return ctx;
  }
}
