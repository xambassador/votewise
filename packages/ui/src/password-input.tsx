"use client";

import type { InputProps } from "./input";

import { forwardRef, useState } from "react";

import { cn } from "@votewise/lib/classnames";

import { Eye } from "./icons/eye";
import { EyeCross } from "./icons/eye-cross";
import { Padlock } from "./icons/padlock";
import { inputWrapper } from "./theme";

type PasswordInputProps = InputProps & { wrapperProps?: React.HTMLAttributes<HTMLDivElement> };
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const { wrapperProps, ...inputProps } = props;
  const hasError = !!inputProps["data-has-error" as keyof typeof inputProps];

  const [showPassword, setShowPassword] = useState(false);
  const type = showPassword ? "text" : "password";

  function onToggle() {
    setShowPassword(!showPassword);
  }

  return (
    <div {...wrapperProps} className={cn(inputWrapper.base, wrapperProps?.className, hasError && inputWrapper.error)}>
      <Padlock className="text-gray-600" />
      <input {...inputProps} type={type} ref={ref} className={cn(inputWrapper.input, inputProps.className)} />
      <button className="absolute top-1/2 right-2 -translate-y-1/2" onClick={onToggle}>
        {showPassword && <EyeCross className="text-gray-600" />}
        {!showPassword && <Eye className="text-gray-600" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
