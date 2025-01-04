"use client";

import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";

import { useOTP } from "../_hooks/use-otp";
import { Timer } from "./timer";

type Props = { total: number; ttl: number };

export function OTPForm(props: Props) {
  const { total, ttl } = props;
  const { loading, onSubmit, onChange } = useOTP();
  return (
    <>
      <InputOTP maxLength={6} onChange={onChange} disabled={loading}>
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <Timer total={total} remainingTime={ttl} />
      <Button loading={loading} onClick={onSubmit}>
        Submit
      </Button>
    </>
  );
}
