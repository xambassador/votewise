"use client";

import type { InputProps } from "./input";

import { forwardRef } from "react";

import { cn } from "./cn";
import { Mail } from "./icons/mail";
import { User } from "./icons/user";
import { inputWrapper } from "./theme";

type EmailInputProps = InputProps & { wrapperProps?: React.HTMLAttributes<HTMLDivElement> };
export const EmailInput = forwardRef<HTMLInputElement, EmailInputProps>((props, ref) => {
  const { wrapperProps, ...inputProps } = props;
  const hasError = !!inputProps["data-has-error" as keyof typeof inputProps];
  return (
    <div {...wrapperProps} className={cn(inputWrapper.base, wrapperProps?.className, hasError && inputWrapper.error)}>
      <Mail className="text-gray-600" />
      <input type="email" ref={ref} {...inputProps} className={cn(inputWrapper.input, inputProps.className)} />
    </div>
  );
});

EmailInput.displayName = "EmailInput";

type UsernameInputProps = InputProps & { wrapperProps?: React.HTMLAttributes<HTMLDivElement> };
export const UsernameInput = forwardRef<HTMLInputElement, UsernameInputProps>((props, ref) => {
  const { wrapperProps, ...inputProps } = props;
  const hasError = !!inputProps["data-has-error" as keyof typeof inputProps];
  return (
    <div {...wrapperProps} className={cn(inputWrapper.base, wrapperProps?.className, hasError && inputWrapper.error)}>
      <User className="text-gray-600" />
      <input type="email" ref={ref} {...inputProps} className={cn(inputWrapper.input, inputProps.className)} />
    </div>
  );
});

UsernameInput.displayName = "UsernameInput";
