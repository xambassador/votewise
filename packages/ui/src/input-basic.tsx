"use client";

import { forwardRef } from "react";

import { cn } from "./cn";
import { inputWrapper } from "./theme";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, hasError, ...props }, ref) => {
  const error = hasError || !!props["data-has-error" as keyof typeof props];
  return (
    <input
      className={cn(
        "bg-nobelBlack-100 text-base text-gray-500 placeholder:text-gray-500 focus-within:border-0 focus-within:outline-none rounded",
        inputWrapper.focus,
        className,
        error && inputWrapper.error
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
