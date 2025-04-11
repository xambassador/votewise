"use server";

import type { TActionResponse } from "@/types";

import { redirect } from "next/navigation";

import { getAuth } from "@/lib/client.server";
import { setFlashMessage } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function forgotPassword(data: { email: string }): Promise<TActionResponse<{ message: string }>> {
  const auth = getAuth();
  const res = await auth.forgotPassword(data.email);
  if (!res.success) {
    return { success: false, error: res.error, errorData: res.errorData };
  }
  setFlashMessage("Success", res.data.message, "success");
  return redirect(routes.auth.signIn());
}
