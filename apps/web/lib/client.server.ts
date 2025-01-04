import type { TApiErrorResponse, TFetchResult } from "@/types";

import { headers } from "next/headers";

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
    "content-type": "application/json",
    accept: "application/json",
    "x-client-id": "votewise-web"
  }
};

const ignoredHeaders = [
  "host",
  "connection",
  "content-length",
  "content-md5",
  "transfer-encoding",
  "expect",
  "te",
  "trailer",
  "upgrade"
];

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

  private async _fetch<T>(url: string, options: RequestInit): Promise<TFetchResult<T>> {
    const headersList = headers();
    const forwardedHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      if (!ignoredHeaders.includes(key)) {
        forwardedHeaders[key.toLowerCase()] = value;
      }
    });
    try {
      const endpoint = `${this.url}${url}`;
      const _options = { ...options, headers: { ...forwardedHeaders, ...this.headers, ...options.headers } };
      const response = await this.fetch(endpoint, _options);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (!response.ok && isJson) {
        const data = (await response.json()) as TApiErrorResponse;
        return { success: false, error: data.error.message, errorData: data.error, status: response.status };
      }

      if (!response.ok && !isJson) {
        return {
          success: false,
          error: response.statusText,
          status: response.status,
          errorData: {
            message: response.statusText,
            name: "NetworkError",
            status_code: response.status
          }
        };
      }

      const data = (await response.json()) as T;
      return { success: true, data };
    } catch (err) {
      let message = "Network Error";
      if (err instanceof Error) {
        message = err.message;
      }

      return {
        success: false,
        error: message,
        errorData: {
          message,
          status_code: 500,
          name: "NetworkError"
        },
        status: 500
      };
    }
  }

  public async get<T>(url: string, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "GET", ...options });
  }

  public async post<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "POST", body: JSON.stringify(body), ...options });
  }

  public async put<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "PUT", body: JSON.stringify(body), ...options });
  }

  public async delete<T>(url: string, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "DELETE", ...options });
  }

  public async patch<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "PATCH", body: JSON.stringify(body), ...options });
  }

  public async head<T>(url: string, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "HEAD", ...options });
  }

  public async options<T>(url: string, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "OPTIONS", ...options });
  }

  public async connect<T>(url: string, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "CONNECT", ...options });
  }

  public async trace<T>(url: string, options?: RequestInit): Promise<TFetchResult<T>> {
    return this._fetch<T>(url, { method: "TRACE", ...options });
  }
}

export const client = new Client();
