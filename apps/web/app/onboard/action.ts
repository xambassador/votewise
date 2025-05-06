"use server";

import type { TOnboard } from "@votewise/schemas/onboard";
import type { ActionResponse } from "@votewise/types";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getOnboard } from "@/lib/client.server";
import { routes } from "@/lib/routes";

type OnboardResponse = { is_onboarded: boolean } & TOnboard;

export async function onboard(props: TOnboard & { isDirty: boolean }): Promise<ActionResponse<OnboardResponse>> {
  isAuthorized<true>({ redirect: true });
  const onboardClient = getOnboard();
  const { isDirty } = props;

  if (props.step === 1) {
    if (!isDirty) {
      return redirect(routes.onboard.step2());
    }

    const res = await onboardClient.onboard({
      step: 1,
      first_name: props.first_name,
      last_name: props.last_name,
      user_name: props.user_name
    });
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    return redirect(routes.onboard.step2());
  }

  if (props.step === 2) {
    if (!isDirty) {
      return redirect(routes.onboard.step3());
    }
    const res = await onboardClient.onboard({
      step: 2,
      about: props.about,
      gender: props.gender
    });
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    return redirect(routes.onboard.step3());
  }

  if (props.step === 3) {
    if (!isDirty) {
      return redirect(routes.onboard.step4());
    }
    const res = await onboardClient.onboard({
      step: 3,
      avatar: props.avatar
    });
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    return redirect(routes.onboard.step4());
  }

  if (props.step === 4) {
    if (!isDirty) {
      return redirect(routes.onboard.step5());
    }
    const res = await onboardClient.onboard({
      step: 4,
      cover: props.cover
    });
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    return redirect(routes.onboard.step5());
  }

  if (props.step === 5) {
    if (!isDirty) {
      return redirect(routes.onboard.step6());
    }
    const res = await onboardClient.onboard({
      step: 5,
      location: props.location,
      facebook: props.facebook,
      twitter: props.twitter,
      instagram: props.instagram
    });
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    return redirect(routes.onboard.step6());
  }

  if (props.step === 6) {
    if (!isDirty) {
      return redirect(routes.app.root());
    }
    const res = await onboardClient.onboard({
      step: 6,
      topics: props.topics
    });
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    return redirect(routes.onboard.step7());
  }

  return redirect(routes.onboard.step1());
}
