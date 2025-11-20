"use client";

import { forwardRef } from "react";

import { cn } from "./cn";
import { inputWrapper } from "./theme";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const { className, hasError, ...rest } = props;
  const isError = hasError || !!props["data-has-error" as keyof typeof props];
  return (
    <textarea
      {...rest}
      ref={ref}
      className={cn(
        "px-5 pt-4 pb-2 bg-nobelBlack-100 border min-h-32 border-nobelBlack-200 text-gray-300 rounded-lg placeholder:text-gray-500 resize-none text-base",
        inputWrapper.focus,
        isError && inputWrapper.error,
        className
      )}
    />
  );
});

Textarea.displayName = "Textarea";
