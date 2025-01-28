"use server";

import type { TActionResponse } from "@/types";
import type { TSignUpForm } from "./_utils";

import { z } from "zod";

import { auth } from "@/lib/client.server";

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

  const response = await auth.signup(validate.data);

  if (!response.success) {
    return { success: false, error: response.error, errorData: response.errorData };
  }

  return {
    success: true,
    data: {
      message: `Verification code sent to ${validate.data.email}. Please check your email to verify your account.`
    }
  };
}
