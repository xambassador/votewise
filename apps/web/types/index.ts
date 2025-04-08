import type { ApiErrorResponse } from "@votewise/types";

export type TAsyncState = "idle" | "loading" | "success" | "error";
export type TActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorData: ApiErrorResponse["error"] };
