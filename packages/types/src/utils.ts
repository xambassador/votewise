export type ApiErrorResponse = {
  error: {
    status_code: number;
    message: string;
    name: string;
    error_code?: number;
    [key: string]: unknown;
  };
};
export type FetchSuccess<T> = { success: true; data: T; headers?: Record<string, string | string[]> };
export type FetchError = {
  success: false;
  error: string;
  errorData: ApiErrorResponse["error"];
  status: number;
  headers?: Record<string, string | string[]>;
};
export type FetchResult<T> = FetchSuccess<T> | FetchError;
export type SafeAction<T> = { success: true; data: T } | { success: false; error: string };
export type AsyncState = "idle" | "loading" | "success" | "error";
