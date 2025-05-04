import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getOnboard } from "@/lib/client.server";
import { getUser } from "@/lib/cookie";
import { routes } from "@/lib/routes";

export async function shouldNotOnboarded() {
  isAuthorized<true>({ redirect: true });
  const user = getUser();
  if (!user) throw new Error("User not found");
  const onboard = getOnboard();
  const res = await onboard.isOnboarded();
  if (!res.success) throw new Error(res.error);
  if (res.data.is_onboarded) {
    return redirect(routes.app.root());
  }
  const onboardData = await onboard.getOnboardSession();
  if (!onboardData.success) throw new Error(onboardData.error);
  return onboardData.data;
}
