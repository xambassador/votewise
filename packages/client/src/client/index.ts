import type { ApiErrorResponse, FetchResult } from "@votewise/types";

type Fetch = typeof fetch;
type Storage = {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};
type ClientOptions = {
  url?: string;
  headers?: Record<string, string>;
  storage?: Storage;
  isSandbox?: boolean;
};

const DEFAULT_OPTIONS: ClientOptions = {
  url: "/api/v1",
  headers: {
    "content-type": "application/json",
    accept: "application/json",
    "x-client-id": "votewise-web"
  }
};

const SANDBOX_MSG = "This action is not allowed in sandbox mode.";

export class Client {
  public readonly url: string;
  public readonly headers?: Record<string, string>;
  public readonly fetch: Fetch = fetch;
  private storage?: Storage;
  private readonly isSandbox: boolean = false;

  constructor(opts?: ClientOptions) {
    const settings = { ...DEFAULT_OPTIONS, ...opts };

    if (!settings.url || settings.url === "") {
      throw new Error("URL is required. Make sure you have set environment variables correctly.");
    }

    this.url = settings.url;
    this.headers = settings.headers;
    this.storage = settings.storage;
    if (typeof window !== "undefined") {
      this.fetch = window.fetch.bind(window);
    }
    this.isSandbox = opts?.isSandbox ?? false;
  }

  private async _fetch<T>(url: string, options: RequestInit): Promise<FetchResult<T>> {
    try {
      const endpoint = `${this.url}${url}`;
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
      const statusCode = response.status;

      if (!response.ok && isJson) {
        const data = (await response.json()) as ApiErrorResponse;
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

      if (statusCode === 204) {
        return { success: true, data: null as unknown as T };
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

  public async get<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this._fetch<T>(url, { method: "GET", ...options });
  }

  public async post<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<FetchResult<T>> {
    return this.withSandboxCheck(() => this._fetch<T>(url, { method: "POST", body: JSON.stringify(body), ...options }));
  }

  public async put<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<FetchResult<T>> {
    return this.withSandboxCheck(() => this._fetch<T>(url, { method: "PUT", body: JSON.stringify(body), ...options }));
  }

  public async delete<T>(url: string, options?: RequestInit): Promise<FetchResult<T>> {
    return this.withSandboxCheck(() => this._fetch<T>(url, { method: "DELETE", ...options }));
  }

  public async deleteWithBody<T, B extends object>(
    url: string,
    body: B,
    options?: RequestInit
  ): Promise<FetchResult<T>> {
    return this.withSandboxCheck(() =>
      this._fetch<T>(url, { method: "DELETE", body: JSON.stringify(body), ...options })
    );
  }

  public async patch<T, B extends object>(url: string, body: B, options?: RequestInit): Promise<FetchResult<T>> {
    return this.withSandboxCheck(() =>
      this._fetch<T>(url, { method: "PATCH", body: JSON.stringify(body), ...options })
    );
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

  public async upload(file: File, options?: RequestInit) {
    const startingByte = 0;
    const chunk = file.slice(startingByte);
    const endingByte = startingByte + chunk.size;
    const handshakeRes = await this.post<{ file_token: string }, { file_name: string }>(
      "/upload/handshake",
      {
        file_name: file.name
      },
      options
    );
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
        "content-type": "",
        ...options?.headers
      },
      credentials: "include"
    });
    return uploadRes;
  }

  public getStorage() {
    return this.storage;
  }

  public setStorage(storage: Storage) {
    this.storage = storage;
  }

  private async withSandboxCheck<T>(fn: () => Promise<FetchResult<T>>): Promise<FetchResult<T>> {
    if (this.isSandbox) {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      return {
        success: false,
        error: SANDBOX_MSG,
        errorData: {
          status_code: 403,
          message: SANDBOX_MSG,
          name: "SandboxError"
        },
        status: 403
      } as unknown as Promise<FetchResult<T>>;
    }
    return fn();
  }
}
