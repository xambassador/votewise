"use client";

import { useRef, useTransition } from "react";

import { makeToast } from "@votewise/ui/toast";

import { verifyEmail } from "../action";

export function useOTP() {
  const value = useRef("");
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
      const res = await verifyEmail(otp);
      if (!res.success) makeToast.error("Ooops!", res.error);
    });
  }

  function onChange(v: string) {
    value.current = v;
  }

  return { loading: isPending, onSubmit, onChange };
}
