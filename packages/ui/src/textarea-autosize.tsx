"use client";

import { forwardRef } from "react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "./cn";
import { inputWrapper } from "./theme";

export interface TextareaProps extends React.ComponentProps<typeof TextareaAutosize> {
  hasError?: boolean;
}

type TextareaRef = HTMLTextAreaElement;
export const Textarea = forwardRef<TextareaRef, TextareaProps>((props, ref) => {
  const { className, hasError, ...rest } = props;
  const isError = hasError || !!props["data-has-error" as keyof typeof props];
  return (
    <TextareaAutosize
      {...rest}
      ref={ref}
      className={cn(
        "bg-nobelBlack-100 text-gray-300 placeholder:text-gray-500 resize-none text-base focus-within:border-0 focus-within:outline-none",
        isError && inputWrapper.error,
        className
      )}
    />
  );
});

Textarea.displayName = "Textarea";
