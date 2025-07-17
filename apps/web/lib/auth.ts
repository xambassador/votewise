import type { AccessTokenPayload } from "@votewise/types";

import { redirect } from "next/navigation";

import { getAuthClient } from "./client.server";
import { routes } from "./routes";

type AuthParam = { redirect?: boolean };
type AuthReturn<T extends boolean = false> = T extends true ? AccessTokenPayload : AccessTokenPayload | null;

/**
 * Checks if the request is authorized or not. If the request is authorized, it returns the user data.
 *
 * @template T
 * @param {AuthParam} param
 * @returns {AuthReturn<T>}
 */
export function isAuthorized<T extends boolean = false>(param: AuthParam = { redirect: false }): AuthReturn<T> {
  const user = getAuthClient().getUser();
  if (user) return user as AuthReturn<T>;
  if (param.redirect) {
    return redirect(routes.auth.signIn()) as AuthReturn<T>;
  }
  return null as AuthReturn<T>;
}
