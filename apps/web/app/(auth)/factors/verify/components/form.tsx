"use client";

import { useRef, useTransition } from "react";

import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";
import { makeToast } from "@votewise/ui/toast";

import { verifyFactor } from "../action";

export function MultiFactorForm() {
  const code = useRef("");
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    code.current = value;
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.current.length || code.current.length < 6) {
      makeToast.error("Oops!", "Please enter a valid 6-digit code.");
      return;
    }
    startTransition(async () => {
      const res = await verifyFactor(code.current);
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
    });
  }

  return (
    <form className="flex flex-col gap-10 max-w-[calc((420/16)*1rem)] w-full" onSubmit={onSubmit}>
      <div className="flex flex-col gap-7">
        <h3 className="text-lg text-gray-300">Enter the 6-digit code from authenticator</h3>
        <InputOTP maxLength={6} onChange={onChange}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button loading={isPending} type="submit">
        Submit
      </Button>
    </form>
  );
}
