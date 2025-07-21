"use client";

import type { VariantProps } from "class-variance-authority";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "./cn";
import { Spinner } from "./ring-spinner";

export const variants = cva(
  "inline-flex relative items-center overflow-hidden justify-center whitespace-nowrap rounded border text-sm duration-100 text-gray-200 px-5 transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-presets",
  {
    variants: {
      variant: {
        primary: "bg-blue-800 hover:bg-blue-700 active:scale-[0.99] border-blue-600 focus-primary",
        secondary:
          "bg-nobelBlack-100 border border-nobelBlack-200 hover:bg-nobelBlack-100/50 active:scale-[0.99] focus-secondary",
        danger: "bg-red-700 hover:bg-red-600 active:scale-[0.99] border-red-600 focus-danger",
        outline:
          "bg-transparent border border-nobelBlack-200 hover:bg-nobelBlack-200 active:scale-[0.99] focus-secondary"
      },
      size: {
        default: "h-10",
        md: "h-11",
        lg: "h-12"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof variants> {
  asChild?: boolean;
  loading?: boolean;
  spinnerProps?: React.ComponentProps<typeof Spinner>;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { className, variant, size, asChild = false, children, loading, disabled, spinnerProps, ...rest } = props;
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  if (asChild) {
    return (
      <Comp {...rest} ref={ref} className={cn(variants({ variant, size, className }))} disabled={isDisabled}>
        {children}
      </Comp>
    );
  }

  return (
    <Comp {...rest} ref={ref} className={cn(variants({ variant, size, className }))} disabled={isDisabled}>
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Spinner {...spinnerProps} className={cn("size-6", spinnerProps?.className)} />
        </div>
      )}
    </Comp>
  );
});

Button.displayName = "Button";
