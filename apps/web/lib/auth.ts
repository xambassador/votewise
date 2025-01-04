import { redirect } from "next/navigation";
import { TokenExpiredError, verify } from "jsonwebtoken";

import { environment } from "@votewise/env";

import { COOKIE_KEYS, getCookie } from "./cookie";
import { routes } from "./routes";

// TODO: We can move this into separate package since our web and api service both use this
export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  amr: { method: string; timestamp: number }[];
  aal: "aal1" | "aal2";
  session_id: string;
  user_aal_level: "aal1" | "aal2";
};
type Codes = "TOKEN_EXPIRED" | "MALFORMED_TOKEN";
type VerifyResult<T> = { success: true; data: T } | { success: false; error: Codes };

export function verifyAccessToken(token: string): VerifyResult<AccessTokenPayload> {
  try {
    const data = verify(token, environment.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
    return { success: true, data };
  } catch (err) {
    return { success: false, error: handleError(err) };
  }
}

function handleError(err: unknown): Codes {
  if (err instanceof TokenExpiredError) {
    return "TOKEN_EXPIRED";
  }
  return "MALFORMED_TOKEN";
}

type AuthParam = { redirect?: boolean };
type AuthReturn<T extends boolean = false> = T extends true
  ? { user: AccessTokenPayload; accessToken: string }
  : { user: AccessTokenPayload; accessToken: string } | null;

export function auth<T extends boolean = false>(param: AuthParam = { redirect: false }): AuthReturn<T> {
  const accessToken = getCookie(COOKIE_KEYS.accessToken);

  if (!accessToken) {
    if (param.redirect) {
      return redirect(routes.auth.signIn()) as AuthReturn<T>;
    }
    return null as AuthReturn<T>;
  }

  const result = verifyAccessToken(accessToken);
  if (!result.success) {
    // TODO: Since we can not clear cookies in RSC, we need to redirect to sign in page with a query param
    // to clear cookies in the middleware
    if (param.redirect) {
      return redirect(routes.auth.signIn()) as AuthReturn<T>;
    }
    return null as AuthReturn<T>;
  }

  return { user: result.data, accessToken } as AuthReturn<T>;
}
