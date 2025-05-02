"use server";

import type { ResetPasswordResponse } from "@votewise/client/auth";
import type { ActionResponse } from "@votewise/types";

import { redirect } from "next/navigation";

import { getAuth } from "@/lib/client.server";
import { setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function resetPassword(data: {
  password: string;
  token: string;
}): Promise<ActionResponse<ResetPasswordResponse>> {
  const { password, token } = data;
  const auth = getAuth();
  const res = await auth.resetPassword({ token, password });
  if (!res.success) return { success: false, error: res.error, errorData: res.errorData };
  setFlashMessage("Password reset successfully", "Your password has been reset successfully", "success");
  return redirect(routes.auth.signIn());
}
