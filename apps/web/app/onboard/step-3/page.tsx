import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";
import { Footer } from "./_components/_footer";
import { BackgrondPicker } from "./_components/bg-picker";
import { BackgroundPickerDialog } from "./_components/bg-picker-dialog";

export default function Page() {
  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, John</OnboardSubtitle>
        <OnboardTitle>Showcase your best background and make your profile stand out!</OnboardTitle>
      </OnboardHeader>
      <BackgrondPicker />
      <BackgroundPickerDialog />
      <Footer />
    </OnboardContainer>
  );
}
