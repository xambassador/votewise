import { OnboardContainer } from "@/app/onboard/_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "@/app/onboard/_components/typography";
import { shouldNotOnboarded, verifyStep } from "@/app/onboard/_utils";

import { getOnboardClient } from "@/lib/client.server";

import { Topics } from "./_components/form";

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  verifyStep(5, onboardingData);
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  const onboard = getOnboardClient();
  const topicsResult = await onboard.getTopics();
  if (!topicsResult.success) throw new Error(topicsResult.error);
  const topics = topicsResult.data.topics;

  return (
    <OnboardContainer>
      <OnboardHeader className="text-center">
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Topics you may interested</OnboardTitle>
      </OnboardHeader>
      <Topics topics={topics} selected={onboardingData.topics} />
    </OnboardContainer>
  );
}
