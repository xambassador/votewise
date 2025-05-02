"use server";

import type { ActionResponse } from "@votewise/types";
import type { TSignUpForm } from "./_utils";

import { getAuth } from "@/lib/client.server";
import { COOKIE_KEYS, setCookie } from "@/lib/cookie";

export async function signup(data: TSignUpForm): Promise<ActionResponse<{ message: string }>> {
  const auth = getAuth();
  const response = await auth.signup(data);

  if (!response.success) {
    return { success: false, error: response.error, errorData: response.errorData };
  }

  setCookie(COOKIE_KEYS.userId, response.data.user_id);
  setCookie(COOKIE_KEYS.email, data.email);
  setCookie(COOKIE_KEYS.verificationCode, response.data.verification_code, {
    expires: new Date(Date.now() + response.data.expires_in)
  });

  return {
    success: true,
    data: {
      message: `Verification code sent to ${data.email}. Please check your email to verify your account.`
    }
  };
}
