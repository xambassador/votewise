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
        "px-5 h-15 bg-nobelBlack-100 border border-nobelBlack-200 rounded-lg text-sm sm:text-base text-gray-300 placeholder:text-gray-500 focus-within:border-blue-500 focus-within:ring-blue-500/20 focus-within:outline-none focus-within:shadow-input-ring focus-within:ring-offset-1 focus-within:ring-offset-nobelBlack-200 outline-none transition-shadow",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
        error && inputWrapper.error
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";
