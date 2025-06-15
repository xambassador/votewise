import { OnboardContainer } from "@/app/onboard/_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "@/app/onboard/_components/typography";
import { shouldNotOnboarded } from "@/app/onboard/_utils";

import { StepTwoForm } from "./_components/form";

export default async function Page() {
  const onboardData = await shouldNotOnboarded();
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋</OnboardSubtitle>
        <OnboardTitle>What should we call you?</OnboardTitle>
      </OnboardHeader>
      <StepTwoForm
        defaultValues={{
          firstName: onboardData.first_name || "",
          userName: onboardData.user_name || "",
          lastName: onboardData.last_name || ""
        }}
      />
    </OnboardContainer>
  );
}
