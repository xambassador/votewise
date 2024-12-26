import { Button } from "@votewise/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";

export default function Page() {
  return (
    <form className="flex flex-col gap-10 max-w-[calc((420/16)*1rem)] w-full">
      <div className="flex flex-col gap-7">
        <h3 className="text-lg text-gray-300">Enter the 6-digit code from authenticator</h3>
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button>Submit</Button>
    </form>
  );
}
