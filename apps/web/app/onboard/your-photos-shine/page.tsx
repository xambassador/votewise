import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { shouldNotOnboarded, verifyStep } from "../_utils";
import { AvatarPicker } from "./_components/avatar-picker";
import { AvatarPickerDialog } from "./_components/avatar-picker-dialog";
import { ChooseAvatarDialog } from "./_components/choose-avatar-dialog";
import { FooterAction } from "./_components/footer";

/* ----------------------------------------------------------------------------------------------- */

export default async function Page() {
  const onboardingData = await shouldNotOnboarded();
  verifyStep(2, onboardingData);
  const name = onboardingData.first_name + " " + onboardingData.last_name;
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, {name}</OnboardSubtitle>
        <OnboardTitle>Show off your best shot and let your photos shine!</OnboardTitle>
      </OnboardHeader>
      <AvatarPicker url={onboardingData.avatar_url || undefined} />
      <AvatarPickerDialog url={onboardingData.avatar_url || undefined} />
      <ChooseAvatarDialog />
      <FooterAction url={onboardingData.avatar_url || undefined} />
    </OnboardContainer>
  );
}
