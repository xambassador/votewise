"use server";

import type { TActionResponse } from "@/types";
import type { TSinginForm } from "./_utils";

import { redirect } from "next/navigation";

import { auth, client } from "@/lib/client.server";
import { clearCookie, COOKIE_KEYS, setCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export type SigninResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: string;
    email_confirmed_at: string;
    email_confirmation_sent_at: string;
    last_sign_in_at: string;
    is_onboarded: boolean;
    user_aal_level: "aal1" | "aal2";
    factors: {
      id: string;
      type: string;
      status: string;
      name: string;
    }[];
  };
};

export async function signin(data: TSinginForm, redirectTo?: string | null): Promise<TActionResponse<SigninResponse>> {
  const res = await auth.signin({ username: data.username, password: data.password });

  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }

  if (!res.data.user.is_onboarded) {
    return redirect(routes.onboard.root());
  }

  const hasFactors = res.data.user.factors.length > 0;
  const hasTotp = res.data.user.factors.find((f) => f.type === "TOTP");
  if (hasFactors && hasTotp) {
    const challengeRes = await client.post<{ id: string; expires_at: string; type: string }, object>(
      `/v1/auth/factors/${hasTotp.id}/challenge`,
      {},
      { headers: { Authorization: `Votewise ${res.data.access_token}` } }
    );
    if (!challengeRes.success) {
      // Let's logout the user for now.
      clearCookie(COOKIE_KEYS.accessToken);
      clearCookie(COOKIE_KEYS.refreshToken);
      clearCookie(COOKIE_KEYS.user);
      clearCookie(COOKIE_KEYS.isOnboarded);
      return { success: false, error: challengeRes.error, errorData: challengeRes.errorData };
    }
    setCookie(COOKIE_KEYS.factorId, hasTotp.id);
    setCookie(COOKIE_KEYS.challengeId, challengeRes.data.id);
    return redirect(routes.auth.verify2FA());
  }

  if (redirectTo) {
    return redirect(redirectTo);
  }
  return redirect(routes.onboard.root());
}
