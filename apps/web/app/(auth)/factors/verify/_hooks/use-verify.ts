"use client";

import { useRef, useTransition } from "react";

import { makeToast } from "@votewise/ui/toast";

import { verifyFactor } from "../action";

export function useVerify() {
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

  return { loading: isPending, onChange, onSubmit };
}
