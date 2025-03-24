export type TAsyncState = "idle" | "loading" | "success" | "error";

export type TApiErrorResponse = {
  error: {
    status_code: number;
    message: string;
    name: string;
    error_code?: number;
    [key: string]: unknown;
  };
};

export type TFetchResult<T> =
  | { success: true; data: T; headers?: Record<string, string | string[]> }
  | {
      success: false;
      error: string;
      errorData: TApiErrorResponse["error"];
      status: number;
      headers?: Record<string, string | string[]>;
    };

export type TActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorData: TApiErrorResponse["error"] };
