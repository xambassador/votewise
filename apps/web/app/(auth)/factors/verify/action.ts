"use server";

import type { TActionResponse } from "@/types";
import type { VerifyResponse } from "@votewise/client/auth";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getAuth } from "@/lib/client.server";
import { clearCookie, COOKIE_KEYS, forwardCookie, getCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function verifyFactor(code: string): Promise<TActionResponse<VerifyResponse>> {
  isAuthorized<true>({ redirect: true });
  const factorId = getCookie(COOKIE_KEYS.factorId);
  const challengeId = getCookie(COOKIE_KEYS.challengeId);

  if (!factorId || !challengeId) {
    // TODO: create a new challenge
    return redirect(routes.auth.logout());
  }

  const authClient = getAuth();
  const res = await authClient.verifyFactor({ code, challengeId, factorId });
  if (!res.success) return res;

  clearCookie(COOKIE_KEYS.factorId);
  clearCookie(COOKIE_KEYS.challengeId);
  forwardCookie(res.headers);

  return redirect(routes.app.root());
}
