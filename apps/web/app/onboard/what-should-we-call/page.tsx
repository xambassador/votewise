import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { getStepOneData } from "../_utils";
import { StepTwoForm } from "./_components/form";

export default function Page() {
  const onboardingData = getStepOneData();
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋</OnboardSubtitle>
        <OnboardTitle>What should we call you?</OnboardTitle>
      </OnboardHeader>
      <StepTwoForm
        defaultValues={{
          firstName: onboardingData ? onboardingData.first_name : "",
          userName: onboardingData ? onboardingData.user_name : "",
          lastName: onboardingData ? onboardingData.last_name : ""
        }}
      />
    </OnboardContainer>
  );
}
