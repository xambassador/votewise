"use server";

import type { VerifyMFAResponse } from "@votewise/client/auth";
import type { ActionResponse } from "@votewise/types";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getMFAClient } from "@/lib/client.server";
import { clearCookie, COOKIE_KEYS, forwardCookie, getCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function verifyFactor(code: string): Promise<ActionResponse<VerifyMFAResponse>> {
  await isAuthorized<true>({ redirect: true });
  const factorId = getCookie(COOKIE_KEYS.factorId);
  const challengeId = getCookie(COOKIE_KEYS.challengeId);

  if (!factorId || !challengeId) {
    // TODO: create a new challenge
    return redirect(routes.auth.logout());
  }

  const mfaClient = getMFAClient();
  const res = await mfaClient.verify(factorId, { code, challenge_id: challengeId });
  if (!res.success) return { success: false, error: res.error, errorData: res.errorData };

  clearCookie(COOKIE_KEYS.factorId);
  clearCookie(COOKIE_KEYS.challengeId);
  forwardCookie(res.headers);

  return redirect(routes.app.root());
}
