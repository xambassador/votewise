import type { DataLayer } from "@votewise/prisma";

import { yellow } from "chalk";
import * as Minio from "minio";

import { Assertions } from "@votewise/errors";
import logger from "@votewise/log";
import { dataLayer } from "@votewise/prisma";

import { Mailer } from "@/emails/mailer";
import { EventBus } from "@/lib/event-bus";
import { RateLimiterManager } from "@/lib/rate-limiter";
import * as Plugins from "@/plugins";
import { createQueues } from "@/queues";
import { createRepositories } from "@/repository";
import * as Services from "@/services";
import { Cache } from "@/storage/redis";
import { checkEnv } from "@/utils";

type ServerConfig = ApplicationConfigs["server"];
type ServerSecrets = ApplicationConfigs["secrets"];

export type AppContextOptions = {
  config: ServerConfig;
  secrets: ServerSecrets;
  dataLayer: DataLayer;
  logger: typeof logger;
  environment: Environment;
  cache: Cache;
  mailer: Mailer;
  repositories: Repositories;
  services: Services;
  queues: Queue;
  assert: Assertions;
  plugins: Plugins;
  rateLimiteManager: RateLimiterManager;
  minio: Minio.Client;
  eventBus: EventBus;
};

/**
 * Singleton class that holds the application context and provides access to various services and configurations.
 * Act as a dependency injection container for the application.
 */
export class AppContext {
  private static _instance: AppContext;

  public config: ServerConfig;
  public secrets: ServerSecrets;
  public dataLayer: DataLayer;
  public logger: typeof logger;
  public environment: Environment;
  public cache: Cache;
  public mailer: Mailer;
  public repositories: Repositories;
  public services: Services;
  public queues: Queue;
  public assert: Assertions;
  public plugins: Plugins;
  public rateLimiteManager: RateLimiterManager;
  public minio: Minio.Client;
  public eventBus: EventBus;

  /**
   * Initializes the AppContext with the provided options. Use `AppContext.fromConfig` to create an instance
   * instead of calling the constructor directly like `new AppContext(...)`.
   *
   * @example
   * const ctx = await AppContext.fromConfig(serverConfig, serverSecrets);
   * @param {AppContextOptions} opts The options to initialize the AppContext.
   */
  constructor(opts: AppContextOptions) {
    this.config = opts.config;
    this.cache = opts.cache;
    this.secrets = opts.secrets;
    this.logger = opts.logger;
    this.environment = opts.environment;
    this.repositories = opts.repositories;
    this.mailer = opts.mailer;
    this.queues = opts.queues;
    this.assert = opts.assert;
    this.plugins = opts.plugins;
    this.rateLimiteManager = opts.rateLimiteManager;
    this.minio = opts.minio;
    this.services = opts.services;
    this.eventBus = opts.eventBus;
    this.dataLayer = opts.dataLayer;

    this.logger.info(`[${yellow("AppContext")}] dependencies initialized`);
  }

  /**
   * Static method to create an instance of `AppContext` from the provided server configuration and secrets.
   * This method initialize the application context only once and returns the same instance on subsequent calls.
   *
   * @static
   * @param {ServerConfig} cfg Server configuration. Use `ServerConfig` to create a valid config.
   * @param {ServerSecrets} secrets Server secrets. Use `ServerSecrets` to create a valid secrets object.
   * @param {Partial<AppContextOptions>} overrides Optional overrides for the AppContext
   * @returns {Promise<AppContext>} A promise that resolves to the AppContext instance.
   */
  static async fromConfig(
    cfg: ServerConfig,
    secrets: ServerSecrets,
    overrides?: Partial<AppContextOptions>
  ): Promise<AppContext> {
    if (this._instance) return this._instance;
    const environment = checkEnv(process.env);
    const assert = new Assertions();
    const cache = new Cache();
    const mailer = new Mailer({ env: environment });
    const repositories = createRepositories(dataLayer);
    const { tasksQueue, uploadCompletedEventQueue, uploadQueue } = createQueues({ env: environment });
    const jwtService = new Services.JWTService({ accessTokenSecret: secrets.jwtSecret });
    const cryptoService = new Services.CryptoService();
    const requestParser = Plugins.requestParserPluginFactory();
    const jwtPlugin = Plugins.jwtPluginFactory({ jwtService });
    const rateLimiteManager = RateLimiterManager.create();
    const minio = new Minio.Client({
      endPoint: environment.MINIO_ENDPOINT,
      port: environment.MINIO_PORT,
      useSSL: environment.USE_SSL,
      accessKey: environment.MINIO_ACCESS_KEY,
      secretKey: environment.MINIO_SECRET_KEY
    });
    const eventBus = EventBus.create();
    const sessionManager = new Services.SessionManager({
      jwtService,
      cache,
      assert,
      cryptoService,
      sessionRepository: repositories.session,
      accessTokenExpiration: cfg.jwt.accessTokenExpiration
    });
    const bucketService = new Services.BucketService({
      minio,
      uploadBucket: cfg.uploadBucket,
      backgroundBucket: cfg.backgroundsBucket,
      avatarBucket: cfg.avatarsBucket,
      minioPort: environment.MINIO_PORT,
      minioEndpoint: environment.MINIO_ENDPOINT
    });
    const onboardService = new Services.OnboardService({
      userRepository: repositories.user,
      cache,
      assert,
      bucketService
    });
    const mlService = new Services.MLService(environment.VOTEWISE_ML_API_URL);
    const realtime = new Services.Realtime({ cryptoService, env: environment, jwtService, logger });
    const ctx = new AppContext({
      config: cfg,
      secrets,
      dataLayer,
      logger,
      environment,
      cache,
      mailer,
      assert,
      rateLimiteManager,
      repositories,
      eventBus,
      queues: { tasksQueue, uploadQueue },
      plugins: { requestParser, jwt: jwtPlugin },
      services: {
        bucket: bucketService,
        crypto: cryptoService,
        jwt: jwtService,
        ml: mlService,
        realtime,
        session: sessionManager,
        onboard: onboardService
      },
      minio,
      ...(overrides ?? {})
    });
    this._instance = ctx;
    cache.onConnect(() => {
      tasksQueue.init();
      uploadQueue.init();
      uploadCompletedEventQueue.init();
      tasksQueue.initWorker(ctx);
      uploadCompletedEventQueue.initWorker(ctx);
    });
    return ctx;
  }

  /**
   * Static getter to access the singleton instance of `AppContext`.
   *
   * @static
   * @returns {AppContext} The AppContext.
   * @throws {Error} If the AppContext is not initialized.
   * @example
   * const ctx = AppContext.instance;
   * console.log(ctx.config);
   */
  static get instance(): AppContext {
    if (!this._instance) throw new Error("AppContext is not initialized");
    return this._instance;
  }

  /**
   * Static method to retrieve a specific service or configuration from the AppContext.
   *
   * @static
   * @see {@link AppContext.getInjectionTokens} for retrieving multiple tokens.
   * @param key The key of the service or configuration to retrieve from the AppContext.
   * @template T The type of the key, which should be a key of `AppContext`.
   * @returns {AppContext[T]} The value associated with the key in the AppContext.
   * @example
   * const jwtService = AppContext.getInjectionToken("jwtService");
   * console.log(jwtService);
   */
  static getInjectionToken<T extends keyof AppContext>(key: T): AppContext[T] {
    return this.instance[key];
  }

  /**
   * Static method to retrieve multiple services or configurations from the AppContext.
   *
   * @static
   * @see {@link AppContext.getInjectionToken} for retrieving a single token.
   * @param keys An array of keys to retrieve from the AppContext.
   * @template T The type of the keys, which should be a subset of keys of `AppContext`.
   * @returns {Pick<AppContext, T>} An object containing the requested keys and their values from the AppContext.
   * @example
   * const { jwtService, mailer } = AppContext.getInjectionTokens(["jwtService", "mailer"]);
   * console.log(jwtService, mailer);
   */
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
