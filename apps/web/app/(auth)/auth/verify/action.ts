"use server";

import type { TActionResponse } from "@/types";
import type { VerifyEmailResponse } from "@votewise/client/auth";

import { redirect } from "next/navigation";

import { auth } from "@/lib/client.server";
import { setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function verifyEmail(otp: string): Promise<TActionResponse<VerifyEmailResponse>> {
  const res = await auth.verifyEmail({ otp });
  if (!res.success) return res;
  setFlashMessage("Verification successful", "Email verified successfully", "success");
  return redirect(routes.auth.signIn());
}
