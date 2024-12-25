import type { TApiErrorResponse, TFetchResult } from "@/types";

import { Debugger } from "@votewise/debug";

const BUCKET_URL = process.env.NEXT_PUBLIC_VOTEWISE_BUCKET_URL;
const API_URL = process.env.NEXT_PUBLIC_VOTEWISE_API_URL;
// TODO: Move to env.ts
if (!BUCKET_URL) throw new Error("NEXT_PUBLIC_VOTEWISE_BUCKET_URL is required");
if (!API_URL) throw new Error("NEXT_PUBLIC_VOTEWISE_API_URL is required");

type Fetch = typeof fetch;
type ClientOptions = {
  url: string;
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  headers?: Record<string, string>;
  // storage
};

const EXPIRY_MARGIN = 10; // in seconds

const NETWORK_FAILURE = {
  MAX_RETRIES: 10,
  RETRY_INTERVAL: 500 // in milliseconds
};

const DEFAULT_OPTIONS: ClientOptions = {
  autoRefreshToken: true,
  persistSession: true,
  url: "",
  headers: {
    "content-type": "application/json",
    accept: "application/json",
    "x-client-id": "votewise-web"
  }
};

const debug = new Debugger("votewise.client");

export class Client {
  public readonly url: string;
  public readonly autoRefreshToken?: boolean;
  public readonly persistSession?: boolean;
  public readonly headers?: Record<string, string>;
  public readonly networkFailure = NETWORK_FAILURE;
  public readonly expiryMargin = EXPIRY_MARGIN;
  public readonly fetch: Fetch = fetch;

  constructor(opts?: ClientOptions) {
    const settings = { ...DEFAULT_OPTIONS, ...opts };

    this.url = settings.url;
    this.autoRefreshToken = settings.autoRefreshToken;
    this.persistSession = settings.persistSession;
    this.headers = settings.headers;
    if (typeof window !== "undefined") {
      this.fetch = window.fetch.bind(window);
    }
  }

  private async _fetch<T>(url: string, options: RequestInit): Promise<TFetchResult<T>> {
    try {
      const endpoint = `${this.url}${url}`;
      debug.info(`fetching ${endpoint}`);
      const _options = { ...options, headers: { ...this.headers, ...options.headers } };
      if (_options.headers) {
        Object.keys(_options.headers).forEach((key) => {
          if (
            _options.headers[key as keyof typeof _options.headers] === undefined ||
            _options.headers[key as keyof typeof _options.headers] === null ||
            _options.headers[key as keyof typeof _options.headers] === ""
          ) {
            delete _options.headers[key as keyof typeof _options.headers];
          }
        });
      }
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
      debug.error(`Error fetching ${url}`, err);
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

  public async upload(file: File) {
    const startingByte = 0;
    const chunk = file.slice(startingByte);
    const endingByte = startingByte + chunk.size;
    const handshakeRes = await this.post<{ file_token: string }, { file_name: string }>("/upload/handshake", {
      file_name: file.name
    });
    if (!handshakeRes.success) {
      return handshakeRes;
    }
    const formData = new FormData();
    formData.append("file", chunk, file.name);
    const uploadRes = await this._fetch<{ url: string }>("/upload", {
      method: "POST",
      body: formData,
      headers: {
        "content-range": `bytes=${startingByte}-${endingByte}/${file.size}`,
        "x-file-token": handshakeRes.data.file_token,
        "content-type": ""
      }
    });
    return uploadRes;
  }
}

export const uploadClient = new Client({ url: BUCKET_URL });
export const client = new Client({ url: API_URL });
