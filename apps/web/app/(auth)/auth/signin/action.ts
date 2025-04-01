"use server";

import type { TActionResponse } from "@/types";
import type { SigninResponse } from "@votewise/client/auth";
import type { TSinginForm } from "./_utils";

import { redirect } from "next/navigation";

import { ERROR_CODES } from "@votewise/constant";

import { getAuth } from "@/lib/client.server";
import { COOKIE_KEYS, forwardCookie, setCookie, setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function signin(data: TSinginForm, redirectTo?: string | null): Promise<TActionResponse<SigninResponse>> {
  const auth = getAuth();
  const res = await auth.signin({ username: data.username, password: data.password });

  if (!res.success && res.errorData.error_code && res.errorData.error_code === ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED) {
    const verificationCode = res.errorData.verification_code;
    const expiresIn = res.errorData.expires_in;
    if (verificationCode && expiresIn && typeof verificationCode === "string" && typeof expiresIn === "number") {
      setCookie(COOKIE_KEYS.verificationCode, verificationCode, { expires: new Date(Date.now() + expiresIn) });
      setCookie(COOKIE_KEYS.email, data.username);
      return redirect(routes.auth.verify());
    }
  }

  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }

  const expiresIn = new Date(Date.now() + res.data.expires_in);
  setCookie(COOKIE_KEYS.user, JSON.stringify(res.data.user), { expires: expiresIn });
  setCookie(COOKIE_KEYS.isOnboarded, res.data.user.is_onboarded ? "true" : "false", { expires: expiresIn });
  forwardCookie(res.headers);

  const hasFactors = res.data.user.factors.length > 0;
  const hasTotp = res.data.user.factors.find((f) => f.type === "TOTP");

  if (hasFactors && hasTotp) {
    // Need to pass access token explicitly because cookies are not set yet on the client and we are
    // making a server side request to challenge the factor.
    const challengeRes = await auth.challengeFactor(hasTotp.id, res.data.access_token);
    if (!challengeRes.success) {
      setFlashMessage("MFA challenge failed", challengeRes.error, "error");
      return challengeRes;
    }

    const expires = new Date(challengeRes.data.expires_at);
    setCookie(COOKIE_KEYS.challengeId, challengeRes.data.id, { expires });
    setCookie(COOKIE_KEYS.factorId, hasTotp.id, { expires });
    return redirect(routes.auth.verify2FA());
  }

  if (!res.data.user.is_onboarded) {
    return redirect(routes.onboard.root());
  }

  if (redirectTo) {
    return redirect(redirectTo);
  }

  return redirect(routes.onboard.root());
}
