import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { shouldNotOnboarded, verifyStep } from "../_utils";
import { OnboardForm } from "./_components/form";

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  verifyStep(1, onboardingData);
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Tell us more about you</OnboardTitle>
      </OnboardHeader>
      <OnboardForm
        defaultValue={{
          gender: onboardingData.gender || "",
          about: onboardingData.about || ""
        }}
      />
    </OnboardContainer>
  );
}
