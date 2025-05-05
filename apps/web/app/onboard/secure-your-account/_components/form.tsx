"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { Button } from "@votewise/ui/button";
import { Spinner } from "@votewise/ui/ring-spinner";

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

  let submitBtn = null;
  if (step === 0) {
    submitBtn = <Button onClick={() => setStep(1)}>Setup 2FA</Button>;
  }

  if (step === 1) {
    submitBtn = <Button>Verify and continue</Button>;
  }

  return (
    <div className="border border-nobelBlack-200 rounded-xl p-8">
      <div className="flex flex-col gap-10">
        {step === 0 && <StepOne />}
        {step === 1 && <AuthenticatorForm />}
        <div className="flex items-center justify-between">
          <Button variant="outline">Skip for now</Button>
          {submitBtn}
        </div>
      </div>
    </div>
  );
}

function StepOne() {
  return (
    <div>
      <h2 className="text-xl text-gray-300 mb-3">Multi-Factor Authentication</h2>
      <p className="text-gray-400 text-sm">
        Protect your account by requiring a second verification method in addition to your password.
      </p>
    </div>
  );
}
