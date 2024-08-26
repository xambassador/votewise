import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";

import { Timer } from "./_components/timer";

export default function Page() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl leading-10 text-gray-300 font-semibold mb-2">Verify your email</h1>
        <p className="text-sm text-gray-300">We have send an OTP to john****@gmail.com</p>
      </div>

      <InputOTP maxLength={6}>
        <InputOTPGroup>
          {Array.from({ length: 6 }).map((_, index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>

      <Timer time={60000 * 5} />

      <Button>Submit</Button>
    </div>
  );
}
