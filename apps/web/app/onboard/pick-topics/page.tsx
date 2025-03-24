import { Onboard } from "@votewise/client/onboard";

import { client } from "@/lib/client.server";

import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { getStepSixData } from "../_utils";
import { Topics } from "./_components/form";

export default async function Page() {
  const onboardingData = getStepSixData();
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  const onboard = new Onboard({ client });
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
