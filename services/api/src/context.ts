import { yellow } from "chalk";
import * as Minio from "minio";

import { Assertions } from "@votewise/errors";
import logger from "@votewise/log";
import { prisma } from "@votewise/prisma";

import { Mailer } from "@/emails/mailer";
import { RateLimiterManager } from "@/lib/rate-limiter";
import * as Plugins from "@/plugins";
import { TasksQueue, UploadCompletedEventQueue } from "@/queues";
import { UploadQueue } from "@/queues/upload";
import * as Repositories from "@/repository";
import * as Services from "@/services";
import { Cache } from "@/storage/redis";
import { checkEnv } from "@/utils";

type Queue = { tasksQueue: TasksQueue; uploadQueue: UploadQueue };
type ServerConfig = ApplicationConfigs["server"];
type ServerSecrets = ApplicationConfigs["secrets"];

export type AppContextOptions = {
  config: ServerConfig;
  secrets: ServerSecrets;
  db: typeof prisma;
  logger: typeof logger;
  environment: Environment;
  cache: Cache;
  mailer: Mailer;
  repositories: Repositories;
  jwtService: Services["jwt"];
  cryptoService: Services["crypto"];
  onboardService: Services["onboard"];
  bucketService: Services["bucket"];
  mlService: Services["ml"];
  sessionManager: Services["session"];
  queues: Queue;
  assert: Assertions;
  plugins: Plugins;
  rateLimiteManager: RateLimiterManager;
  minio: Minio.Client;
};

export class AppContext {
  private static _instance: AppContext;

  public config: ServerConfig;
  public secrets: ServerSecrets;
  public db: typeof prisma;
  public logger: typeof logger;
  public environment: Environment;
  public cache: Cache;
  public mailer: Mailer;
  public repositories: Repositories;
  public jwtService: Services["jwt"];
  public cryptoService: Services["crypto"];
  public bucketService: Services["bucket"];
  public mlService: Services["ml"];
  public queues: Queue;
  public assert: Assertions;
  public sessionManager: Services["session"];
  public plugins: Plugins;
  public rateLimiteManager: RateLimiterManager;
  public minio: Minio.Client;
  public onboardService: Services["onboard"];

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
    this.onboardService = opts.onboardService;
    this.bucketService = opts.bucketService;
    this.mlService = opts.mlService;
    this.queues = opts.queues;
    this.assert = opts.assert;
    this.sessionManager = opts.sessionManager;
    this.plugins = opts.plugins;
    this.rateLimiteManager = opts.rateLimiteManager;
    this.minio = opts.minio;

    this.logger.info(`[${yellow("AppContext")}] dependencies initialized`);
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
    const jwtService = new Services.JWTService({ accessTokenSecret: secrets.jwtSecret });
    const cryptoService = new Services.CryptoService();
    const userRepository = new Repositories.UserRepository({ db });
    const factorRepository = new Repositories.FactorRepository({ db });
    const challengeRepository = new Repositories.ChallengeRepository({ db });
    const refreshTokenRepository = new Repositories.RefreshTokenRepository({ db });
    const sessionRepository = new Repositories.SessionRepository({ db });
    const topicRepository = new Repositories.TopicRepository({ db });
    const userInterestRepository = new Repositories.UserInterestRepository({ db });
    const feedRepository = new Repositories.FeedRepository({ db });
    const followRepository = new Repositories.FollowRepository({ db });
    const timelineRepository = new Repositories.TimelineRepository({ db });
    const feedAssetRepository = new Repositories.FeedAssetRepository({ db });
    const postTopicRepository = new Repositories.PostTopicRepository({ db });
    const mailer = new Mailer({ env: environment });
    const tasksQueue = new TasksQueue({ env: environment });
    const uploadQueue = new UploadQueue({ env: environment });
    const uploadCompletedEventQueue = new UploadCompletedEventQueue({ env: environment });
    const sessionManager = new Services.SessionManager({
      jwtService,
      cache,
      assert,
      cryptoService,
      sessionRepository,
      accessTokenExpiration: cfg.jwt.accessTokenExpiration
    });
    const requestParser = Plugins.requestParserPluginFactory();
    const jwtPlugin = Plugins.jwtPluginFactory({ jwtService });
    const rateLimiteManager = RateLimiterManager.create();
    const minio = new Minio.Client({
      endPoint: environment.MINIO_ENDPOINT,
      port: environment.MINIO_PORT,
      useSSL: false, // TODO: Get this from env
      accessKey: environment.MINIO_ACCESS_KEY,
      secretKey: environment.MINIO_SECRET_KEY
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
      userRepository,
      cache,
      assert,
      bucketService
    });
    const mlService = new Services.MLService("http://localhost:5003"); // TODO: Move to env
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
      rateLimiteManager,
      onboardService,
      bucketService,
      mlService,
      repositories: {
        user: userRepository,
        factor: factorRepository,
        challenge: challengeRepository,
        refreshToken: refreshTokenRepository,
        session: sessionRepository,
        topic: topicRepository,
        userInterest: userInterestRepository,
        feed: feedRepository,
        follow: followRepository,
        timeline: timelineRepository,
        feedAsset: feedAssetRepository,
        postTopic: postTopicRepository
      },
      queues: { tasksQueue, uploadQueue },
      plugins: { requestParser, jwt: jwtPlugin },
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
