"use server";

import type { TActionResponse } from "@/types";
import type { VerifyResponse } from "@votewise/client/auth";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { auth as authClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

export async function verifyFactor(code: string): Promise<TActionResponse<VerifyResponse>> {
  isAuthorized<true>({ redirect: true });
  const res = await authClient.verifyFactor(code);
  if (!res.success) return res;
  return redirect(routes.app.root());
}
