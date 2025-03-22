"use server";

import type { TActionResponse } from "@/types";
import type { SigninResponse } from "@votewise/client/auth";
import type { TSinginForm } from "./_utils";

import { redirect } from "next/navigation";

import { ERROR_CODES } from "@votewise/constant";

import { auth } from "@/lib/client.server";
import { COOKIE_KEYS, forwardCookie, setCookie, setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function signin(data: TSinginForm, redirectTo?: string | null): Promise<TActionResponse<SigninResponse>> {
  const res = await auth.signin({ username: data.username, password: data.password });

  if (!res.success) {
    if (res.errorData.error_code && res.errorData.error_code === ERROR_CODES.AUTH.EMAIL_NOT_VERIFIED) {
      const verificationCode = res.errorData.verification_code;
      const expiresIn = res.errorData.expires_in;
      if (verificationCode && expiresIn && typeof verificationCode === "string" && typeof expiresIn === "number") {
        setCookie(COOKIE_KEYS.verificationCode, verificationCode, { expires: new Date(Date.now() + expiresIn) });
        setCookie(COOKIE_KEYS.email, data.username);
        return redirect(routes.auth.verify());
      }
    }
    return { success: false, error: res.error, errorData: res.errorData };
  }

  forwardCookie(res.headers);

  const expiresIn = new Date(Date.now() + res.data.expires_in);
  setCookie(COOKIE_KEYS.user, JSON.stringify(res.data.user), { expires: expiresIn });
  setCookie(COOKIE_KEYS.isOnboarded, res.data.user.is_onboarded ? "true" : "false", { expires: expiresIn });

  if (!res.data.user.is_onboarded) {
    return redirect(routes.onboard.root());
  }

  const hasFactors = res.data.user.factors.length > 0;
  const hasTotp = res.data.user.factors.find((f) => f.type === "TOTP");
  if (hasFactors && hasTotp) {
    const challengeRes = await auth.challengeFactor(hasTotp.id);
    if (!challengeRes.success) {
      setFlashMessage("MFA challenge failed", challengeRes.error, "error");
      return challengeRes;
    }
    return redirect(routes.auth.verify2FA());
  }

  if (redirectTo) {
    return redirect(redirectTo);
  }
  return redirect(routes.onboard.root());
}
