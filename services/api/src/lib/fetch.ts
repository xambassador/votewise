import type { RequestInit } from "node-fetch";

import _fetch from "node-fetch";

export type FetchResponse<T> = { success: true; data: T } | { success: false; error: string };

export async function fetch<T>(url: string, options?: RequestInit): Promise<FetchResponse<T>> {
  try {
    const res = await _fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });

    const isJsonResponse = res.headers.get("content-type")?.includes("application/json");
    const isOk = res.ok;
    if (!isOk && !isJsonResponse) {
      return { success: false, error: `Failed to fetch ${url}: ${res.status} ${res.statusText}` };
    }

    if (!isOk && isJsonResponse) {
      const errorResponse = (await res.json()) as { error: { message: string } };
      return { success: false, error: errorResponse?.error?.message || res.statusText };
    }

    const data = (await res.json()) as T;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: `Failed to fetch ${url}` };
  }
}
