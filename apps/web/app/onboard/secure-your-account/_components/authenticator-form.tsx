"use client";

import { useRef, useTransition } from "react";

import { Button } from "@votewise/ui/button";
import { Copy } from "@votewise/ui/icons/copy";
import { Input, InputField } from "@votewise/ui/input-field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";
import { makeToast } from "@votewise/ui/toast";

import { skipMultiFactorAction, verifyMultiFactorAction } from "../action";

export function AuthenticatorForm(props: { factorId: string; qrCode: string; secret: string }) {
  const { qrCode, secret, factorId } = props;
  const [isPending, startTransition] = useTransition();
  const [skipIsPending, startSkipTransition] = useTransition();
  const value = useRef("");

  function onVerify() {
    const otp = value.current;
    if (!otp) {
      makeToast.error("Ooops!", "Please enter the OTP code.");
      return;
    }

    const isValid = otp.length === 6;
    if (!isValid) {
      makeToast.error("Ooops!", "OTP code must be 6 digits.");
      return;
    }

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
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="sm:text-xl text-lg text-gray-300">Set up Authenticator App</h2>
          <p className="text-sm text-gray-400">
            Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <h3 className="text-gray-300 text-sm">1. Scan this QR code with your authenticator app</h3>
            <div className="rounded-[1.25rem] bg-nobelBlack-200 py-6 grid place-items-center min-h-[10.625rem] max-h-[10.625rem]">
              <QRCode url={qrCode} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-gray-300 text-sm">2. Or manually enter this setup key</h3>
            <InputField>
              <Input value={secret} readOnly />
              <button>
                <Copy className="text-black-300" />
              </button>
            </InputField>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-gray-300 text-sm">3. Enter the 6-digit verification code</h3>
            <InputOTP maxLength={6} onChange={(v) => (value.current = v)}>
              <InputOTPGroup className="justify-between w-full">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:flex-row flex-col gap-2 sm:gap-0">
        <Button
          className="w-full sm:w-fit"
          variant="outline"
          onClick={onSkip}
          disabled={isPending}
          loading={skipIsPending}
        >
          Skip for now
        </Button>
        <Button className="w-full sm:w-fit" onClick={onVerify} loading={isPending} disabled={skipIsPending}>
          Verify and continue
        </Button>
      </div>
    </>
  );
}

function QRCode({ url }: { url: string }) {
  return (
    <div className="size-[7.5rem] bg-white-50 relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="QR" className="size-full absolute inset-0 object-cover rounded-lg" />
    </div>
  );
}
