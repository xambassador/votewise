"use client";

import type { VariantProps } from "class-variance-authority";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@votewise/lib/classnames";

const variants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded text-sm duration-500 text-gray-200 px-5 transition-[colors_transform] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-blue-800 hover:bg-blue-700 active:scale-95",
        secondary: "bg-nobelBlack-100 border border-nobelBlack-200 hover:bg-nobelBlack-200 active:scale-95",
        danger: "bg-red-700 hover:bg-red-600 active:scale-95",
        outline: "bg-transparent border border-nobelBlack-200 hover:bg-nobelBlack-200 active:scale-95"
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
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { className, variant, size, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : "button";
  return <Comp {...rest} ref={ref} className={cn(variants({ variant, size, className }))} />;
});

Button.displayName = "Button";
