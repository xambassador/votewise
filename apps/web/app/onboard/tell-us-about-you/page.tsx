import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { OnboardForm } from "./_components/form";

export default function Page() {
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, John</OnboardSubtitle>
        <OnboardTitle>Tell us more about you</OnboardTitle>
      </OnboardHeader>
      <OnboardForm />
    </OnboardContainer>
  );
}
