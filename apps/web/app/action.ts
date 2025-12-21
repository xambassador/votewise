"use server";

import type { EnrollMFAResponse } from "@votewise/client/mfa";
import type { TDisableMFA } from "@votewise/schemas/auth";
import type { ActionResponse } from "@votewise/types";

import { redirect } from "next/navigation";

import { getMFAClient, getOnboardClient } from "@/lib/client.server";
import { clearAllCookies, forwardCookie, setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function enrollMultiFactorAction(): Promise<ActionResponse<EnrollMFAResponse>> {
  const mfa = getMFAClient();
  const res = await mfa.enroll();
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  return { success: true, data: res.data };
}

const defaultMsg = "Welcome to Votewise! Your account is now secure. Please login again to continue.";

export async function verifyMultiFactorAction(
  factorId: string,
  otp: string,
  msg = defaultMsg
): Promise<ActionResponse<{ is_onboarded: boolean }>> {
  const mfa = getMFAClient();
  const challengeRes = await mfa.challenge(factorId);
  if (!challengeRes.success) {
    return { success: false, error: challengeRes.error, errorData: challengeRes.errorData };
  }
  const verifyRes = await mfa.verify(factorId, { challenge_id: challengeRes.data.id, code: otp });
  if (!verifyRes.success) {
    return { success: false, error: verifyRes.error, errorData: verifyRes.errorData };
  }

  const onboard = getOnboardClient();
  const res = await onboard.onboard({ step: 7, has_setup_2fa: true });
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  setFlashMessage("Onboard complete!", msg, "success");
  clearAllCookies();
  return redirect(routes.auth.signIn());
}

export async function skipMultiFactorAction(): Promise<ActionResponse<{ is_onboarded: boolean }>> {
  const onboard = getOnboardClient();
  const res = await onboard.onboard({ step: 7, has_setup_2fa: false });
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  forwardCookie(res.headers);
  setFlashMessage("Onboard complete!", "Welcome to Votewise!", "success");
  return redirect(routes.app.root());
}

export async function disableMFAAction(factorId: string, data: TDisableMFA) {
  const mfa = getMFAClient();
  const challengeRes = await mfa.challenge(factorId);
  if (!challengeRes.success) {
    return { success: false, error: challengeRes.error, errorData: challengeRes.errorData };
  }
  data.challenge_id = challengeRes.data.id;
  const res = await mfa.disable(factorId, data);
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  return { success: true, data: res.data };
}
