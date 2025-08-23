"use server";

import { redirect } from "next/navigation";

import { getAuthClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

export async function logoutAction() {
  const auth = getAuthClient();
  await auth.signout();
  return redirect(routes.auth.signIn());
}
