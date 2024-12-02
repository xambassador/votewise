import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { StepTwoForm } from "./_components/form";

export default function Page() {
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋</OnboardSubtitle>
        <OnboardTitle>What should we call you?</OnboardTitle>
      </OnboardHeader>
      <StepTwoForm />
    </OnboardContainer>
  );
}
