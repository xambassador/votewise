export type TAsyncState = "idle" | "loading" | "success" | "error";

export type TApiErrorResponse = {
  error: {
    status_code: number;
    message: string;
    name: string;
    error_code?: number;
  };
};

export type TFetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorData: TApiErrorResponse["error"]; status: number };

export type TActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorData: TApiErrorResponse["error"] };
