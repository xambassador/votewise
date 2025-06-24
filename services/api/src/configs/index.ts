import { Millisecond } from "@votewise/times";

export class ServerSecrets {
  public jwtSecret: string;
  public jwtRefreshSecret: string;
  public cronSecret: string;

  constructor(cfg: ServerSecrets) {
    this.jwtSecret = cfg.jwtSecret;
    this.jwtRefreshSecret = cfg.jwtRefreshSecret;
    this.cronSecret = cfg.cronSecret;
  }
}

export class Cors {
  public origin?: string;
  public methods?: string;
  public allowedHeaders?: string;
  public exposedHeaders?: string;
  public credentials?: boolean;
  public maxAge?: number;

  constructor(cfg: Cors) {
    this.origin = cfg.origin;
    this.methods = cfg.methods;
    this.allowedHeaders = cfg.allowedHeaders;
    this.exposedHeaders = cfg.exposedHeaders;
    this.credentials = cfg.credentials;
    this.maxAge = cfg.maxAge;
  }
}

export class SSL {
  public key: string;
  public cert: string;

  constructor(cfg: SSL) {
    this.key = cfg.key;
    this.cert = cfg.cert;
  }
}

export class JWT {
  public accessTokenExpiration: number;
  public refreshTokenExpiration: number;

  constructor(cfg: JWT) {
    this.accessTokenExpiration = cfg.accessTokenExpiration;
    this.refreshTokenExpiration = cfg.refreshTokenExpiration;
  }
}

export class ServerConfig {
  public port: number;
  public hostname: string;
  public publicUrl: string;
  public version?: string;
  public blobUploadLimit: number;
  public devMode: boolean;
  public connectionGraceTimeout?: number;
  public workerGraceTimeout?: number;
  public forceQuitTimeout?: number;
  public cors?: Cors;
  public ssl?: SSL;
  public jwt: JWT;
  public appUrl: string;
  public bucketUrl: string;
  public appName?: string;
  public uploadBucket: string;
  public avatarsBucket: string;
  public backgroundsBucket: string;
  public keepAliveTimeout?: number = 61 * Millisecond;
  public headersTimeout?: number = 61 * Millisecond;
  public requestTimeout?: number = 30 * Millisecond;
  public serverTimeout?: number = 30 * Millisecond;

  constructor(cfg: ServerConfig) {
    this.port = cfg.port;
    this.hostname = cfg.hostname;
    this.publicUrl = cfg.publicUrl;
    this.version = cfg.version;
    this.blobUploadLimit = cfg.blobUploadLimit;
    this.devMode = cfg.devMode;
    this.connectionGraceTimeout = cfg.connectionGraceTimeout;
    this.workerGraceTimeout = cfg.workerGraceTimeout;
    this.forceQuitTimeout = cfg.forceQuitTimeout;
    this.cors = cfg.cors;
    this.ssl = cfg.ssl;
    this.jwt = cfg.jwt;
    this.appUrl = cfg.appUrl;
    this.bucketUrl = cfg.bucketUrl;
    this.appName = cfg.appName;
    this.uploadBucket = cfg.uploadBucket;
    this.avatarsBucket = cfg.avatarsBucket;
    this.backgroundsBucket = cfg.backgroundsBucket;
    this.keepAliveTimeout = cfg.keepAliveTimeout ?? this.keepAliveTimeout;
    this.headersTimeout = cfg.headersTimeout ?? this.headersTimeout;
    this.requestTimeout = cfg.requestTimeout ?? this.requestTimeout;
    this.serverTimeout = cfg.serverTimeout ?? this.serverTimeout;
  }
}

declare global {
  interface ApplicationConfigs {
    server: ServerConfig;
    secrets: ServerSecrets;
    cors: Cors;
    ssl: SSL;
    jwt: JWT;
  }
}
