"use client";

import { useRef, useTransition } from "react";

import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";
import { makeToast } from "@votewise/ui/toast";

import { verifyEmail } from "../action";
import { Timer } from "./timer";

type Props = { total: number; ttl: number };

export function OTPForm(props: Props) {
  const { total, ttl } = props;
  const value = useRef<string>("");
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
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
      verifyEmail(otp);
    });
  }

  return (
    <>
      <InputOTP maxLength={6} onChange={(v) => (value.current = v)} disabled={isPending}>
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Timer total={total} remainingTime={ttl} />
      <Button loading={isPending} onClick={onSubmit}>
        Submit
      </Button>
    </>
  );
}
