"use server";

import type { TChangePassword } from "@votewise/schemas/auth";

import { getAuthClient } from "@/lib/client.server";

export async function changePasswordAction(data: TChangePassword) {
  const authClient = getAuthClient();
  const res = await authClient.changePassword(data);
  return res;
}
