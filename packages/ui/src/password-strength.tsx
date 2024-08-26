"use client";

import { forwardRef } from "react";

import { cn } from "@votewise/lib/classnames";

export function checkStrength(password: string) {
  // - At least 8 characters long
  // - At least 1 lowercase letter
  // - At least 1 uppercase letter
  // - At least 1 number
  // - At least 1 special character
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;
  return { hasLowerCase, hasUpperCase, hasNumber, hasSpecial, hasLength };
}
export type Strength = ReturnType<typeof checkStrength>;

type PasswordStrengthProps = React.HTMLAttributes<HTMLDivElement> & { password: string };
export const PasswordStrength = forwardRef<HTMLDivElement, PasswordStrengthProps>((props, ref) => {
  const { password, ...rest } = props;

  const strength = checkStrength(password);
  const isValid = (valid: boolean) => (valid ? "bg-green-500" : "bg-nobelBlack-200");
  const base = "min-w-10 max-w-10 h-1 rounded-full";

  return (
    <div {...rest} className={cn("flex items-center gap-1", rest.className)} ref={ref}>
      <div className={cn(base, isValid(strength.hasLength))} />
      <div className={cn(base, isValid(strength.hasLowerCase))} />
      <div className={cn(base, isValid(strength.hasNumber))} />
      <div className={cn(base, isValid(strength.hasSpecial))} />
      <div className={cn(base, isValid(strength.hasUpperCase))} />
    </div>
  );
});
PasswordStrength.displayName = "PasswordStrength";
