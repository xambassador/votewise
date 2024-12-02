import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { SocialsForm } from "./_components/form";

export default function Page() {
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, John</OnboardSubtitle>
        <OnboardTitle>Connect Your Socials and Location!</OnboardTitle>
      </OnboardHeader>
      <SocialsForm />
    </OnboardContainer>
  );
}
