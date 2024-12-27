import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";

export default function Page() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-7">
        <p className="text-sm text-gray-300">Enter the 6-digit code from authenticator</p>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button>Submit</Button>
    </div>
  );
}
