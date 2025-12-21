"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";

import { Button } from "@votewise/ui/button";
import { Spinner } from "@votewise/ui/ring-spinner";
import { makeToast } from "@votewise/ui/toast";

import { enrollMultiFactorAction, skipMultiFactorAction } from "@/app/action";

const AuthenticatorForm = dynamic(() => import("./authenticator-form").then((m) => m.AuthenticatorForm), {
  ssr: false,
  loading: () => (
    <div className="grid place-items-center min-h-32">
      <Spinner />
    </div>
  )
});

export function SetupMFAForm() {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [isSkipPending, startSkipTransition] = useTransition();
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");

  function onSetupMFA() {
    startTransition(async () => {
      const res = await enrollMultiFactorAction();
      if (!res.success) {
        makeToast.error("Oops!", res.error);
        return;
      }

      setFactorId(res.data.id);
      setQrCode(res.data.totp.qr_code);
      setSecret(res.data.totp.secret);
      setStep(1);
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
    <div className="border border-nobelBlack-200 rounded-xl p-8">
      <div className="flex flex-col gap-10">
        {step === 0 && (
          <StepOne
            actionBtnProps={{ onClick: onSetupMFA, loading: isPending, disabled: isSkipPending }}
            skipBtnProps={{ disabled: isPending, onClick: onSkip, loading: isSkipPending }}
          />
        )}
        {step === 1 && <AuthenticatorForm factorId={factorId} qrCode={qrCode} secret={secret} />}
      </div>
    </div>
  );
}

function StepOne(props: {
  actionBtnProps?: React.ComponentProps<typeof Button>;
  skipBtnProps?: React.ComponentProps<typeof Button>;
}) {
  return (
    <>
      <div>
        <h2 className="sm:text-xl text-lg text-gray-300 mb-3">Multi-Factor Authentication</h2>
        <p className="text-gray-400 text-sm">
          Protect your account by requiring a second verification method in addition to your password.
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Button {...props.skipBtnProps} variant="outline">
          Skip for now
        </Button>
        <Button {...props.actionBtnProps}>Setup 2FA</Button>
      </div>
    </>
  );
}
