import type { ApiErrorResponse, FetchResult } from "@votewise/types";

import { environment } from "@votewise/env";

type Fetch = typeof fetch;
type Options = {
  expires?: Date | undefined;
  secure?: boolean | undefined;
  sameSite?: true | false | "lax" | "strict" | "none" | undefined;
  path?: string | undefined;
  maxAge?: number | undefined;
  httpOnly?: boolean | undefined;
  domain?: string | undefined;
};
type Storage = {
  get: (key: string) => string | null | undefined;
  set: (key: string, value: string, options?: Options) => void;
  remove: (key: string) => void;
};
type ClientOptions = {
  url?: string;
  headers?: Record<string, string>;
  headersFactory: () => Record<string, string>;
  storage?: Storage;
  timeout?: number;
};

const VOTEWISE_API = environment.VOTEWISE_API_URL;

const DEFAULT_OPTIONS: ClientOptions = {
  url: VOTEWISE_API,
  timeout: 30_000, // 30 seconds
  headersFactory: () => ({}),
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
  public readonly url: string | undefined;
  public readonly headers: Record<string, string> | undefined;
  public readonly fetch: Fetch = fetch;
  private storage: Storage | undefined;
  private readonly headersFactory: () => Record<string, string>;

  constructor(opts?: ClientOptions) {
    const settings = { ...DEFAULT_OPTIONS, ...opts };

    this.url = settings.url;
    this.headers = settings.headers;
    this.headersFactory = settings.headersFactory;
    this.storage = settings.storage;
  }

  private async _fetch<T>(url: string, options: RequestInit & { timeout?: number }): Promise<FetchResult<T>> {
    const headersList = this.headersFactory();
    const forwardedHeaders: Record<string, string> = {};
    Object.entries(headersList).forEach(([key, value]) => {
      if (!ignoredHeaders.includes(key)) {
        forwardedHeaders[key.toLowerCase()] = value;
      }
    });
    const signal = options.signal;
    const controller = new AbortController();
    const timeoutInMs = options.timeout ?? 30_000;

    if (signal) {
      signal.addEventListener("abort", () => controller.abort(signal.reason));
    }

    const timeoutHandler = () => controller.abort(new Error("Request timed out"));
    const timeoutId = setTimeout(timeoutHandler, timeoutInMs);

    try {
      const endpoint = `${this.url}${url}`;
      const _options = {
        ...options,
        headers: { ...forwardedHeaders, ...this.headers, ...options.headers },
        signal: controller.signal
      };
      const response = await this.fetch(endpoint, _options);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const responseHeaders: Record<string, string | string[]> = {};
      const statusCode = response.status;

      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          // Maybe there are multiple cookies in the response
          responseHeaders[key] = responseHeaders[key] ? [...responseHeaders[key], value] : [value];
        } else {
          responseHeaders[key] = value;
        }
      });

      if (!response.ok && isJson) {
        const data = (await response.json()) as ApiErrorResponse;
        return {
          success: false,
          error: data.error.message,
          errorData: data.error,
          status: response.status,
          headers: responseHeaders
        };
      }

      if (!response.ok && !isJson) {
        return {
          success: false,
          error: response.statusText,
          status: response.status,
          headers: responseHeaders,
          errorData: {
            message: response.statusText,
            name: "NetworkError",
            status_code: response.status
          }
        };
      }

      if (statusCode === 204) {
        return { success: true, data: null as unknown as T, headers: responseHeaders };
      }

      const data = (await response.json()) as T;
      return { success: true, data, headers: responseHeaders };
    } catch (err) {
      let message = "Network Error";
      if (err instanceof Error) {
        message = err.message;
      }

      if (err instanceof Error && err.name === "AbortError") {
        return {
          status: 408,
          success: false,
          error: "Request takes too long to respond.",
          errorData: {
            message: "Request takes too long to respond.",
            name: "AbortError",
            status_code: 408
          }
        };
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
    } finally {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener("abort", timeoutHandler);
    }
  }

  public async get<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "GET", ...options });
  }

  public async post<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "POST", body: JSON.stringify(body), ...options });
  }

  public async put<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "PUT", body: JSON.stringify(body), ...options });
  }

  public async delete<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "DELETE", ...options });
  }

  public async deleteWithBody<T, B extends object>(
    url: string,
    body: B,
    options?: RequestInit
  ): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "DELETE", body: JSON.stringify(body), ...options });
  }

  public async patch<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "PATCH", body: JSON.stringify(body), ...options });
  }

  public async head<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "HEAD", ...options });
  }

  public async options<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "OPTIONS", ...options });
  }

  public async connect<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "CONNECT", ...options });
  }

  public async trace<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "TRACE", ...options });
  }

  public getStorage() {
    return this.storage;
  }

  public setStorage(storage: Storage) {
    this.storage = storage;
  }
}
