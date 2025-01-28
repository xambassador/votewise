"use server";

import type { TActionResponse } from "@/types";
import type { SigninResponse } from "@votewise/client/auth";
import type { TSinginForm } from "./_utils";

import { redirect } from "next/navigation";

import { auth } from "@/lib/client.server";
import { setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

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
    const challengeRes = await auth.challengeFactor(hasTotp.id, res.data.access_token);
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
