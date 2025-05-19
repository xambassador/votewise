"use client";

import type { InputFieldProps, InputProps, InputRef } from "./input-field";

import { forwardRef, useState } from "react";

import { Eye } from "./icons/eye";
import { EyeCross } from "./icons/eye-cross";
import { Padlock } from "./icons/padlock";
import { Input, InputField } from "./input-field";

/* -----------------------------------------------------------------------------------------------
 * PasswordInput
 * -----------------------------------------------------------------------------------------------*/
export type PasswordInputProps = InputProps & { wrapperProps?: InputFieldProps };
export const PasswordInput = forwardRef<InputRef, PasswordInputProps>((props, ref) => {
  const { wrapperProps, ...inputProps } = props;
  const hasError = !!inputProps["data-has-error"];

  const [showPassword, setShowPassword] = useState(false);
  const type = showPassword ? "text" : "password";

  function onToggle() {
    setShowPassword(!showPassword);
  }

  return (
    <InputField {...wrapperProps} hasError={hasError}>
      <Padlock className="text-gray-600" />
      <Input autoComplete="current-password" {...inputProps} type={type} ref={ref} />
      <button type="button" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={onToggle}>
        {showPassword && <EyeCross className="text-gray-600" />}
        {!showPassword && <Eye className="text-gray-600" />}
      </button>
    </InputField>
  );
});
PasswordInput.displayName = "PasswordInput";
