import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { shouldNotOnboarded } from "../_utils";
import { BackgrondPicker } from "./_components/bg-picker";
import { BackgroundPickerDialog } from "./_components/bg-picker-dialog";
import { FooterAction } from "./_components/footer";

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Showcase your best background and make your profile stand out!</OnboardTitle>
      </OnboardHeader>
      <BackgrondPicker url={onboardingData.cover_image_url || undefined} />
      <BackgroundPickerDialog />
      <FooterAction url={onboardingData.cover_image_url || undefined} />
    </OnboardContainer>
  );
}
