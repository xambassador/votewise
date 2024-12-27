"use server";

import { redirect } from "next/navigation";
import { client } from "@/lib/client.server";
import { clearAllCookies, COOKIE_KEYS, getCookie, setCookie } from "@/lib/cookie";
import { routes } from "@/lib/routes";

type VerifyEmailResponse = {
  user_id: string;
  email: string;
  is_email_verify: boolean;
};

type VerifyEmailBody = {
  email: string;
  verification_code: string;
  otp: string;
  user_id: string;
};

function clearAndGoToSignIn() {
  clearAllCookies();
  return redirect(routes.auth.signIn());
}

export async function verifyEmail(otp: string) {
  const email = getCookie(COOKIE_KEYS.email);
  const userId = getCookie(COOKIE_KEYS.userId);
  const verificationCode = getCookie(COOKIE_KEYS.verificationCode);

  if (!email || !userId || !verificationCode) {
    clearAndGoToSignIn();
    return;
  }

  const response = await client.patch<VerifyEmailResponse, VerifyEmailBody>("/v1/auth/verify", {
    email,
    verification_code: verificationCode,
    otp,
    user_id: userId
  });

  if (!response.success) {
    clearAndGoToSignIn();
    return;
  }

  clearAllCookies([COOKIE_KEYS.email, COOKIE_KEYS.userId, COOKIE_KEYS.verificationCode]);
  setCookie(
    COOKIE_KEYS.flash,
    JSON.stringify({ title: "Verification successful", message: "Email verified successfully", type: "success" })
  );

  redirect(routes.auth.signIn());
}
