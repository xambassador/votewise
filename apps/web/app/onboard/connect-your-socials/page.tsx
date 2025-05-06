import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { shouldNotOnboarded, verifyStep } from "../_utils";
import { SocialsForm } from "./_components/form";

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  verifyStep(4, onboardingData);
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Connect Your Socials and Location!</OnboardTitle>
      </OnboardHeader>
      <SocialsForm
        defaultValues={{
          location: onboardingData.location || "",
          facebook: onboardingData.facebook_profile_url || undefined,
          instagram: onboardingData.instagram_profile_url || undefined,
          twitter: onboardingData.twitter_profile_url || undefined
        }}
        name={name}
      />
    </OnboardContainer>
  );
}
