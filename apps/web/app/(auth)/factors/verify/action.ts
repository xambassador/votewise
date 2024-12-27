"use server";

import type { TActionResponse } from "@/types";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { client } from "@/lib/client.server";
import { clearAllCookies, clearCookie, COOKIE_KEYS, getCookie, setCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

type VerifyResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
};

type VerifyBody = {
  challenge_id: string;
  code: string;
};

export async function verifyFactor(code: string): Promise<TActionResponse<VerifyResponse>> {
  const { accessToken } = auth<true>({ redirect: true });
  const challengeId = getCookie(COOKIE_KEYS.challengeId);
  const factorId = getCookie(COOKIE_KEYS.factorId);
  if (!challengeId || !factorId) {
    clearAllCookies();
    return redirect(routes.auth.signIn());
  }

  const res = await client.post<VerifyResponse, VerifyBody>(
    `/v1/auth/factors/${factorId}/verify`,
    {
      challenge_id: challengeId,
      code
    },
    { headers: { Authorization: `Votewise ${accessToken}` } }
  );

  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }

  const expires = new Date(Date.now() + res.data.expires_in);
  clearCookie(COOKIE_KEYS.challengeId);
  clearCookie(COOKIE_KEYS.factorId);
  setCookie(COOKIE_KEYS.accessToken, res.data.access_token, { expires });
  setCookie(COOKIE_KEYS.refreshToken, res.data.refresh_token, { expires });
  return redirect(routes.app.root());
}
