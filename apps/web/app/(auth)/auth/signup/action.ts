"use server";

import type { TActionResponse } from "@/types";
import type { TSignUpForm } from "./_utils";

import { client } from "@/lib/client.server";
import { COOKIE_KEYS, setCookie } from "@/lib/cookie";
import { z } from "zod";

type TSignupResponse = {
  user_id: string;
  verification_code: string;
  expires_in: number;
};

const ZSignUpForm = z.object({
  email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email address" }),
  password: z.string({ required_error: "Password is required" })
});

export async function signup(data: TSignUpForm): Promise<TActionResponse<{ message: string }>> {
  const validate = ZSignUpForm.safeParse(data);

  if (!validate.success) {
    return {
      success: false,
      error: validate.error.errors[0].message,
      errorData: { message: validate.error.errors[0].message, name: "Validation", status_code: 400 }
    };
  }

  const { email, password } = validate.data;

  const response = await client.post<TSignupResponse, TSignUpForm>("/v1/auth/register", {
    email,
    password
  });

  if (!response.success) {
    return { success: false, error: response.error, errorData: response.errorData };
  }

  setCookie(COOKIE_KEYS.userId, response.data.user_id, { expires: new Date(Date.now() + response.data.expires_in) });
  setCookie(COOKIE_KEYS.verificationCode, response.data.verification_code, {
    expires: new Date(Date.now() + response.data.expires_in)
  });
  setCookie(COOKIE_KEYS.email, email, { expires: new Date(Date.now() + response.data.expires_in) });

  return {
    success: true,
    data: { message: `Verification code sent to ${email}. Please check your email to verify your account.` }
  };
}
