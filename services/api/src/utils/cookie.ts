import type { CookieOptions } from "express";

import { environment } from "@votewise/env";

export function getCookieOptions(options?: CookieOptions): CookieOptions {
  return {
    httpOnly: true,
    signed: true,
    secure: environment.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    ...options
  };
}
