"use server";

import type { TActionResponse } from "@/types";
import type { VerifyResponse } from "@votewise/client/auth";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { auth as authClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

export async function verifyFactor(code: string): Promise<TActionResponse<VerifyResponse>> {
  const { accessToken } = auth<true>({ redirect: true });
  const res = await authClient.verifyFactor(code, accessToken);
  if (!res.success) return res;
  return redirect(routes.app.root());
}
