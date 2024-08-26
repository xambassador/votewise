"use client";

import { forwardRef } from "react";

import { cn } from "@votewise/lib/classnames";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "px-5 h-15 bg-nobelBlack-100 border border-nobelBlack-200 rounded-lg text-base text-gray-500 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:shadow-input-ring focus:ring-offset-1 focus:ring-offset-nobelBlack-200 transition-shadow",
      className
    )}
    ref={ref}
    {...props}
  />
));

Input.displayName = "Input";
