"use server";

import type { EnrollMFAResponse } from "@votewise/client/mfa";
import type { ActionResponse } from "@votewise/types";

import { redirect } from "next/navigation";

import { getMFA, getOnboard } from "@/lib/client.server";
import { clearAllCookies, setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function enrollMultiFactorAction(): Promise<ActionResponse<EnrollMFAResponse>> {
  const mfa = getMFA();
  const res = await mfa.enroll();
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  return { success: true, data: res.data };
}

export async function verifyMultiFactorAction(
  factorId: string,
  otp: string
): Promise<ActionResponse<{ is_onboarded: boolean }>> {
  const mfa = getMFA();
  const challengeRes = await mfa.challenge(factorId);
  if (!challengeRes.success) {
    return { success: false, error: challengeRes.error, errorData: challengeRes.errorData };
  }
  const verifyRes = await mfa.verify(factorId, { challenge_id: challengeRes.data.id, code: otp });
  if (!verifyRes.success) {
    return { success: false, error: verifyRes.error, errorData: verifyRes.errorData };
  }

  const onboard = getOnboard();
  const res = await onboard.onboard({ step: 7, has_setup_2fa: true });
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  const msg = "Welcome to Votewise! Your account is now secure. Please login again to continue.";
  setFlashMessage("Onboard complete!", msg, "success");
  clearAllCookies();
  return redirect(routes.auth.signIn());
}

export async function skipMultiFactorAction(): Promise<ActionResponse<{ is_onboarded: boolean }>> {
  const onboard = getOnboard();
  const res = await onboard.onboard({ step: 7, has_setup_2fa: false });
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  setFlashMessage("Onboard complete!", "Welcome to Votewise!", "success");
  return redirect(routes.app.root());
}
