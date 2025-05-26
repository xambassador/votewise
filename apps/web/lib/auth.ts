import type { AccessTokenPayload } from "@votewise/types";

import { redirect } from "next/navigation";

import { getAuthClient } from "./client.server";
import { routes } from "./routes";

type AuthParam = { redirect?: boolean };
type AuthReturn<T extends boolean = false> = T extends true ? AccessTokenPayload : AccessTokenPayload | null;

export function isAuthorized<T extends boolean = false>(param: AuthParam = { redirect: false }): AuthReturn<T> {
  const user = getAuthClient().getUser();
  if (!user) {
    if (param.redirect) {
      return redirect(routes.auth.signIn()) as AuthReturn<T>;
    }
    return null as AuthReturn<T>;
  }
  return user as AuthReturn<T>;
}
