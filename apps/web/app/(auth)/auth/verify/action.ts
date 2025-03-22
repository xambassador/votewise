"use server";

import type { TActionResponse } from "@/types";
import type { VerifyEmailResponse } from "@votewise/client/auth";

import { redirect } from "next/navigation";

import { auth } from "@/lib/client.server";
import { clearCookie, COOKIE_KEYS, getCookie, setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function verifyEmail(otp: string): Promise<TActionResponse<VerifyEmailResponse>> {
  const email = getCookie(COOKIE_KEYS.email);
  const verificationCode = getCookie(COOKIE_KEYS.verificationCode);
  if (!email || !verificationCode) {
    return {
      success: false,
      errorData: { message: "Invalid request", status_code: 400, name: "InvalidRequest" },
      error: "Invalid request"
    };
  }
  const res = await auth.verifyEmail({ otp, email, verificationCode });
  if (!res.success) return res;
  clearCookie(COOKIE_KEYS.email);
  clearCookie(COOKIE_KEYS.verificationCode);
  clearCookie(COOKIE_KEYS.userId);
  setFlashMessage("Verification successful", "Email verified successfully", "success");
  return redirect(routes.auth.signIn());
}
