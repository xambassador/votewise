"use client";

import type { InputFieldProps, InputProps, InputRef } from "./input-field";

import { forwardRef } from "react";

import { Mail } from "./icons/mail";
import { User } from "./icons/user";
import { Input, InputField } from "./input-field";

/* -----------------------------------------------------------------------------------------------
 * EmailInput
 * -----------------------------------------------------------------------------------------------*/
export type EmailInputProps = InputProps & { wrapperProps?: InputFieldProps };
export const EmailInput = forwardRef<InputRef, EmailInputProps>((props, ref) => {
  const { wrapperProps, ...inputProps } = props;
  const hasError = !!inputProps["data-has-error"];
  return (
    <InputField {...wrapperProps} hasError={hasError}>
      <Mail className="text-gray-600" />
      <Input autoComplete="email" {...inputProps} type="email" ref={ref} />
    </InputField>
  );
});

EmailInput.displayName = "EmailInput";

/* -----------------------------------------------------------------------------------------------
 * UsernameInput
 * -----------------------------------------------------------------------------------------------*/
type UsernameInputProps = InputProps & { wrapperProps?: InputFieldProps };
export const UsernameInput = forwardRef<InputRef, UsernameInputProps>((props, ref) => {
  const { wrapperProps, ...inputProps } = props;
  const hasError = !!inputProps["data-has-error"];
  return (
    <InputField {...wrapperProps} hasError={hasError}>
      <User className="text-gray-600" />
      <Input autoComplete="email" type="email" ref={ref} {...inputProps} />
    </InputField>
  );
});

UsernameInput.displayName = "UsernameInput";
