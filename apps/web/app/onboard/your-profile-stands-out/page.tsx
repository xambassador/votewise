import { OnboardContainer } from "@/app/onboard/_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "@/app/onboard/_components/typography";
import { shouldNotOnboarded, verifyStep } from "@/app/onboard/_utils";

import { BackgroundPicker } from "./_components/bg-picker";
import { BackgroundPickerDialog } from "./_components/bg-picker-dialog";
import { FooterAction } from "./_components/footer";

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  verifyStep(3, onboardingData);
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Showcase your best background and make your profile stand out!</OnboardTitle>
      </OnboardHeader>
      <BackgroundPicker url={onboardingData.cover_image_url || undefined} />
      <BackgroundPickerDialog />
      <FooterAction url={onboardingData.cover_image_url || undefined} />
    </OnboardContainer>
  );
}
