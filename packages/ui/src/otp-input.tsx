"use client";

import { forwardRef, useContext } from "react";
import { OTPInput, OTPInputContext } from "input-otp";

import { cn } from "@votewise/lib/classnames";

export const InputOTP = forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  )
);
InputOTP.displayName = "InputOTP";

export const InputOTPGroup = forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-3", className)} {...props} />
);
InputOTPGroup.displayName = "InputOTPGroup";

export const InputOTPSlot = forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret = true, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-15 h-15 rounded-lg bg-nobelBlack-100 border border-nobelBlack-200 text-gray-500 flex flex-col items-center justify-center",
        isActive &&
          "z-10 border-blue-500 ring-blue-500/20 outline-none shadow-input-ring ring-offset-1 ring-offset-nobelBlack-200",
        className
      )}
      {...props}
    >
      {char}
      {!isActive && !char && (
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-2 h-px rounded-full bg-gray-500" />
      )}
      {hasFakeCaret && isActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-gray-600 duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";
