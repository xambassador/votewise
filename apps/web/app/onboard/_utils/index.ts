import type { GetUserOnboardSessionResponse } from "@votewise/client/onboard";

import { redirect } from "next/navigation";

import { ZOnboard } from "@votewise/schemas/onboard";

import { isAuthorized } from "@/lib/auth";
import { getOnboardClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

export async function shouldNotOnboarded() {
  const user = await isAuthorized<true>({ redirect: true });
  const onboard = getOnboardClient();
  if (user.is_onboarded) {
    return redirect(routes.app.root());
  }
  const onboardData = await onboard.getOnboardSession();
  if (!onboardData.success) throw new Error(onboardData.error);
  return onboardData.data;
}

export function verifyStep(step: number, data: GetUserOnboardSessionResponse) {
  const validationData = {
    ...data,
    avatar: data.avatar_url,
    cover: data.cover_image_url,
    location: data.location,
    topics: data.topics
  };
  for (let i = 1; i < step; i++) {
    const verify = ZOnboard.safeParse({ step: i, ...validationData });
    if (!verify.success) {
      return redirect(routes.onboard[`step${i}` as keyof typeof routes.onboard]());
    }
  }

  return true;
}
