import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { getStepFiveData } from "../_utils";
import { SocialsForm } from "./_components/form";

export default function Page() {
  const onboardingData = getStepFiveData();
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Connect Your Socials and Location!</OnboardTitle>
      </OnboardHeader>
      <SocialsForm
        defaultValues={{
          location: onboardingData.location,
          facebook: onboardingData.facebook_url,
          instagram: onboardingData.instagram_url,
          twitter: onboardingData.twitter_url,
          name
        }}
      />
    </OnboardContainer>
  );
}
