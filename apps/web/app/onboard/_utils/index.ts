import { redirect } from "next/navigation";

import { isAuthorized } from "@/lib/auth";
import { getOnboard } from "@/lib/client.server";
import { getOnboardingData, getUser } from "@/lib/cookie";
import { routes } from "@/lib/routes";

type OnboardingData = Awaited<ReturnType<typeof getOnboardingData>>;

export function getStepOneData() {
  const onboardingData = getOnboardingData();
  return onboardingData;
}

function checkStepOneData(data: OnboardingData) {
  if (!data || !data.user_name || !data.first_name || !data.last_name) {
    return redirect(routes.onboard.step1());
  }
  return data;
}

function checkStepTwoData(data: OnboardingData) {
  const stepOneData = checkStepOneData(data);
  if (!stepOneData.gender || !stepOneData.about) {
    return redirect(routes.onboard.step2());
  }
  return stepOneData;
}

function checkStepThreeData(data: OnboardingData) {
  const stepTwoData = checkStepTwoData(data);
  if (!stepTwoData.avatar_url) {
    return redirect(routes.onboard.step3());
  }
  return stepTwoData;
}

function checkStepFourData(data: OnboardingData) {
  const stepThreeData = checkStepThreeData(data);
  if (!stepThreeData.cover_url) {
    return redirect(routes.onboard.step4());
  }
  return stepThreeData;
}

function checkStepFiveData(data: OnboardingData) {
  const stepFourData = checkStepFourData(data);
  if (!stepFourData.location) {
    return redirect(routes.onboard.step5());
  }
  return stepFourData;
}

export function getStepTwoData() {
  const onboardingData = getOnboardingData();
  return checkStepOneData(onboardingData);
}

export function getStepThreeData() {
  const onboardingData = getOnboardingData();
  return checkStepTwoData(onboardingData);
}

export function getStepFourData() {
  const onboardingData = getOnboardingData();
  return checkStepThreeData(onboardingData);
}

export function getStepFiveData() {
  const onboardingData = getOnboardingData();
  return checkStepFourData(onboardingData);
}

export function getStepSixData() {
  const onboardingData = getOnboardingData();
  return checkStepFiveData(onboardingData);
}

export async function shouldNotOnboarded() {
  isAuthorized<true>({ redirect: true });
  const user = getUser();
  if (!user) throw new Error("User not found");
  const onboard = getOnboard();
  const res = await onboard.isOnboarded(user.id);
  if (!res.success) throw new Error(res.error);
  if (res.data.is_onboarded) {
    return redirect(routes.app.root());
  }
  return res.data;
}
