import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { AvatarPicker } from "./_components/avatar-picker";
import { AvatarPickerDialog } from "./_components/avatar-picker-dialog";
import { ChooseAvatarDialog } from "./_components/choose-avatar-dialog";
import { FooterAction } from "./_components/footer";

/* ----------------------------------------------------------------------------------------------- */

export default function Page() {
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, John</OnboardSubtitle>
        <OnboardTitle>Show off your best shot and let your photos shine!</OnboardTitle>
      </OnboardHeader>
      <AvatarPicker />
      <AvatarPickerDialog />
      <ChooseAvatarDialog />
      <FooterAction />
    </OnboardContainer>
  );
}
