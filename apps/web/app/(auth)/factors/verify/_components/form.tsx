"use client";

import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";

import { useVerify } from "../_hooks/use-verify";

export function MultiFactorForm() {
  const { loading, onSubmit, onChange } = useVerify();
  return (
    <form className="flex flex-col gap-10 max-w-[calc((420/16)*1rem)] w-full" onSubmit={onSubmit}>
      <div className="flex flex-col gap-7">
        <h3 className="text-lg text-gray-300">Enter the 6-digit code from authenticator</h3>
        <InputOTP maxLength={6} onChange={onChange} disabled={loading}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button loading={loading} type="submit">
        Submit
      </Button>
    </form>
  );
}
