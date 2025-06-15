import { OnboardContainer } from "@/app/onboard/_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "@/app/onboard/_components/typography";
import { shouldNotOnboarded, verifyStep } from "@/app/onboard/_utils";

import { SetupMFAForm } from "./_components/form";

export default async function Page() {
  const onboardData = await shouldNotOnboarded();
  verifyStep(6, onboardData);
  return (
    <OnboardContainer className="max-w-[calc((530/16)*1rem)] min-w-[calc((530/16)*1rem)]">
      <OnboardHeader className="items-center">
        <OnboardSubtitle>Hello 👋, {onboardData.first_name + " " + onboardData.last_name}</OnboardSubtitle>
        <OnboardTitle>Secure Your Account</OnboardTitle>
        <OnboardSubtitle className="text-base text-gray-400">
          Your password is like underwear. Two layers are better than one.
        </OnboardSubtitle>
      </OnboardHeader>
      <SetupMFAForm />
    </OnboardContainer>
  );
}
