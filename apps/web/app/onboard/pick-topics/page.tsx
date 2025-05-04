import { getOnboard } from "@/lib/client.server";

import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { shouldNotOnboarded } from "../_utils";
import { Topics } from "./_components/form";

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  const onboard = getOnboard();
  const topicsResult = await onboard.getTopics();
  if (!topicsResult.success) throw new Error(topicsResult.error);
  const topics = topicsResult.data.topics;

  return (
    <OnboardContainer>
      <OnboardHeader className="text-center">
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Topics you may interested</OnboardTitle>
      </OnboardHeader>
      <Topics topics={topics} />
    </OnboardContainer>
  );
}
