import { VOTEWISE_API } from "./constants";

type Fetch = typeof fetch;
type ClientOptions = {
  url: string;
  autoRefreshToken: boolean;
  persistSession: boolean;
  headers: Record<string, string>;
  // storage
};

const EXPIRY_MARGIN = 10; // in seconds
const NETWORK_FAILURE = {
  MAX_RETRIES: 10,
  RETRY_INTERVAL: 500 // in milliseconds
};
const DEFAULT_OPTIONS: ClientOptions = {
  url: VOTEWISE_API,
  autoRefreshToken: true,
  persistSession: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Client-Id": "votewise-web"
  }
};

export class Client {
  private static nextInstanceId = 0;
  private readonly instanceId: number;

  public readonly url: string;
  public readonly autoRefreshToken: boolean;
  public readonly persistSession: boolean;
  public readonly headers: Record<string, string>;
  public readonly networkFailure = NETWORK_FAILURE;
  public readonly expiryMargin = EXPIRY_MARGIN;

  public readonly fetch: Fetch = fetch;

  constructor(opts?: ClientOptions) {
    this.instanceId = Client.nextInstanceId++;

    if (this.instanceId > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Multiple instances of Client detected.`);
    }

    const settings = { ...DEFAULT_OPTIONS, ...opts };

    this.url = settings.url;
    this.autoRefreshToken = settings.autoRefreshToken;
    this.persistSession = settings.persistSession;
    this.headers = settings.headers;
  }
}

export const client = new Client();
