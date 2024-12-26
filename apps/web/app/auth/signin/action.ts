"use server";

import type { TActionResponse } from "@/types";
import type { TSinginForm } from "./_utils";

import { redirect } from "next/navigation";
import { client } from "@/lib/client.server";
import { COOKIE_KEYS, setCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

type SigninResponse = {
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
    factors: {
      id: string;
      type: string;
      status: string;
      name: string;
    }[];
  };
};

export async function signin(data: TSinginForm, redirectTo?: string | null): Promise<TActionResponse<SigninResponse>> {
  const res = await client.post<SigninResponse, { email: string; password: string }>("/v1/auth/signin", {
    email: data.username,
    password: data.password
  });

  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }

  const expires = new Date(Date.now() + res.data.expires_in);
  setCookie(COOKIE_KEYS.accessToken, res.data.access_token, { expires });
  setCookie(COOKIE_KEYS.refreshToken, res.data.refresh_token, { expires });
  setCookie(COOKIE_KEYS.user, JSON.stringify(res.data.user), { expires });
  setCookie(COOKIE_KEYS.is_onboarded, res.data.user.is_onboarded ? "true" : "false", { expires });

  const hasFactors = res.data.user.factors.length > 0;
  if (hasFactors) {
    return redirect(routes.auth.verify2FA());
  }

  if (redirectTo) {
    return redirect(redirectTo);
  }
  return redirect(routes.onboard.root());
}
