"use client";

import { useTransition } from "react";

import { Button } from "@votewise/ui/button";
import { makeToast } from "@votewise/ui/toast";

import { MFAForm } from "@/components/mfa-form";

import { skipMultiFactorAction, verifyMultiFactorAction } from "@/app/action";

export function AuthenticatorForm(props: { factorId: string; qrCode: string; secret: string }) {
  const { qrCode, secret, factorId } = props;
  const [isPending, startTransition] = useTransition();
  const [skipIsPending, startSkipTransition] = useTransition();

  function onVerify(otp: string) {
    startTransition(async () => {
      const res = await verifyMultiFactorAction(factorId, otp);
      if (!res.success) {
        makeToast.error("Ooops!", res.error);
        return;
      }

      makeToast.success("Success!", "Authenticator app has been set up successfully.");
    });
  }

  function onSkip() {
    startSkipTransition(async () => {
      const res = await skipMultiFactorAction();
      if (!res.success) {
        makeToast.error("Ooops!", res.error);
        return;
      }
    });
  }

  return (
    <MFAForm
      qrCode={qrCode}
      secret={secret}
      submitButtonProps={{
        loading: isPending,
        disabled: skipIsPending
      }}
      onVerify={onVerify}
    >
      <Button
        className="w-full sm:w-fit"
        variant="outline"
        onClick={onSkip}
        disabled={isPending}
        loading={skipIsPending}
      >
        Skip for now
      </Button>
    </MFAForm>
  );
}
