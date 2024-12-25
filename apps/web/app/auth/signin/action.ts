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

export async function signin(data: TSinginForm): Promise<TActionResponse<SigninResponse>> {
  const res = await client.post<SigninResponse, { email: string; password: string }>("/v1/auth/signin", {
    email: data.username,
    password: data.password
  });

  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }

  setCookie(COOKIE_KEYS.accessToken, res.data.access_token, { expires: new Date(Date.now() + res.data.expires_in) });
  setCookie(COOKIE_KEYS.refreshToken, res.data.refresh_token, { expires: new Date(Date.now() + res.data.expires_in) });
  setCookie(COOKIE_KEYS.user, JSON.stringify(res.data.user), { expires: new Date(Date.now() + res.data.expires_in) });

  // TODO: If factors exist, redirect to the 2fa page.

  if (!res.data.user.is_onboarded) {
    return redirect(routes.onboard.root());
  }

  return { success: true, data: res.data };
}
