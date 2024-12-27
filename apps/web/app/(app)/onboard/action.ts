"use server";

import type { TActionResponse } from "@/types";
import type { TOnboard } from "@votewise/schemas/onboard";
import type { TStepFiveForm } from "./connect-your-socials/_hooks/use-step";
import type { TStepTwoForm } from "./tell-us-about-you/_hooks/use-step";
import type { TStepOneForm } from "./what-should-we-call/_utils";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { client } from "@/lib/client.server";
import { clearCookie, COOKIE_KEYS, setCookie, setOnboardingData } from "@/lib/cookie";
import { routes } from "@/lib/routes";

import { getStepFiveData } from "./utils";

type Props = Partial<TStepOneForm> &
  Partial<TStepTwoForm> &
  Partial<{ avatar: string }> &
  Partial<{ cover: string }> &
  Partial<TStepFiveForm> & { step: number };

type OnboardResponse = { is_onboarded: boolean } & TOnboard;

export async function onboard(props: Props): Promise<TActionResponse<OnboardResponse>> {
  const user = auth<true>({ redirect: true });

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
    const onboardingData = { ...getStepFiveData(), ...props };
    const res = await client.patch<OnboardResponse, TOnboard>(
      "/v1/user/onboard",
      {
        user_name: onboardingData.user_name,
        first_name: onboardingData.first_name,
        last_name: onboardingData.last_name,
        about: onboardingData.about,
        avatar_url: onboardingData.avatar_url,
        cover_url: onboardingData.cover_url,
        gender: onboardingData.gender,
        location: onboardingData.location,
        facebook_url: onboardingData.facebook_url,
        twitter_url: onboardingData.twitter_url,
        instagram_url: onboardingData.instagram_url
      },
      { headers: { Authorization: `Votewise ${user.accessToken}` } }
    );
    if (!res.success) {
      return { success: false, error: res.error, errorData: res.errorData };
    }
    setCookie(
      COOKIE_KEYS.flash,
      JSON.stringify({ message: "Welcome to Votewise!", title: "Onboard complete!", type: "success" })
    );
    setCookie(COOKIE_KEYS.isOnboarded, "true");
    clearCookie(COOKIE_KEYS.onboard);
    return redirect(routes.app.root());
  }

  return redirect(routes.onboard.step1());
}
