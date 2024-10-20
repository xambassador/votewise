"use client";

import { forwardRef } from "react";

import { cn } from "./cn";
import { createContext } from "./context";
import { inputWrapper } from "./theme";

export type InputFieldProps = React.HTMLAttributes<HTMLDivElement> & { hasError?: boolean };

const [Provider, useInputField] = createContext<{ id?: string }>("InputField");

export const InputField = forwardRef<HTMLDivElement, InputFieldProps>((props, ref) => {
  const { hasError, className, id, ...rest } = props;
  const error = hasError || !!rest["data-has-error" as keyof typeof rest];
  return (
    <Provider id={id}>
      <div {...rest} className={cn(inputWrapper.base, className, error && inputWrapper.error)} ref={ref} />
    </Provider>
  );
});
InputField.displayName = "InputField";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const { id } = useInputField("Input");
  return <input id={id} {...props} ref={ref} className={cn(inputWrapper.input, props.className)} />;
});
Input.displayName = "Input";

export type InputFieldRef = React.ElementRef<typeof InputField>;
export type InputRef = React.ElementRef<typeof Input>;
