"use server";

import type { TActionResponse } from "@/types";
import type { TOnboard } from "@votewise/schemas/onboard";
import type { TConnectYourSocials, TTellUsAboutYou, TWhatShouldWeCall } from "./_utils/schema";

import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { onboard as onboardClient } from "@/lib/client.server";
import { COOKIE_KEYS, getUser, setCookie, setOnboardingData } from "@/lib/cookie";
import { routes } from "@/lib/routes";

import { getStepFiveData } from "./_utils";

type Props = Partial<TWhatShouldWeCall> &
  Partial<TTellUsAboutYou> &
  Partial<{ avatar: string }> &
  Partial<{ cover: string }> &
  Partial<TConnectYourSocials> & { step: number };

type OnboardResponse = { is_onboarded: boolean } & TOnboard;

export async function onboard(props: Props): Promise<TActionResponse<OnboardResponse>> {
  isAuthorized<true>({ redirect: true });

  if (props.step === 1) {
    setOnboardingData({ user_name: props.userName, first_name: props.firstName, last_name: props.lastName });
    return redirect(routes.onboard.step2());
  }

  if (props.step === 2) {
    setOnboardingData({ gender: props.gender, about: props.about });
    return redirect(routes.onboard.step3());
  }

  if (props.step === 3) {
    setOnboardingData({ avatar_url: props.avatar });
    return redirect(routes.onboard.step4());
  }

  if (props.step === 4) {
    setOnboardingData({ cover_url: props.cover });
    return redirect(routes.onboard.step5());
  }

  if (props.step === 5) {
    const stepFiveData = getStepFiveData();
    setOnboardingData({ ...stepFiveData, ...props });
    const user = getUser();
    if (!user) {
      return {
        success: false,
        error: "User not found",
        errorData: { status_code: 401, name: "Unauthorized", message: "User not found" }
      };
    }
    const onboardingData = { ...stepFiveData, ...props };
    const res = await onboardClient.onboard(user.id, onboardingData);
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    setCookie(
      COOKIE_KEYS.flash,
      JSON.stringify({ message: "Welcome to Votewise!", title: "Onboard complete!", type: "success" })
    );
    setCookie(COOKIE_KEYS.isOnboarded, "true");
    return redirect(routes.onboard.step6());
  }

  return redirect(routes.onboard.step1());
}
