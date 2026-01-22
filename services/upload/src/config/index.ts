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

export class AppHeaders {
  public fileToken: string;
  public assetType: string;

  constructor(cfg?: AppHeaders) {
    this.fileToken = cfg?.fileToken || "x-file-token";
    this.assetType = cfg?.assetType || "x-asset-type";
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
  public appHeaders: AppHeaders;
  public uploadBucket: string;
  public avatarBucket: string;
  public backgroundsBucket: string;
  public imageCacheTTL: number;

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
    this.appHeaders = cfg.appHeaders;
    this.uploadBucket = cfg.uploadBucket;
    this.avatarBucket = cfg.avatarBucket;
    this.backgroundsBucket = cfg.backgroundsBucket;
    this.imageCacheTTL = cfg.imageCacheTTL;
  }
}
