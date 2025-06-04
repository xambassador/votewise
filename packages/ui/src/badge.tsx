import type { VariantProps } from "class-variance-authority";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "./cn";

const badgeVariants = cva(
  "inline-flex items-center border justify-center rounded-full px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden focus:outline-none focus-visible:outline-none focus:ring-offset-1 focus:shadow-input-ring",
  {
    variants: {
      variant: {
        default:
          "bg-nobelBlack-200 border-black-400 text-gray-300 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-offset-nobelBlack-200",
        secondary: "bg-blue-600 border-blue-700 text-gray-50 focus:ring-blue-500/20 focus:ring-offset-nobelBlack-200",
        destructive: "bg-red-600 border-red-700 text-gray-50 focus:ring-red-500/20 focus:ring-offset-nobelBlack-200",
        outline: "text-gray-300 focus:ring-blue-500/20 focus:ring-offset-nobelBlack-200 border-nobelBlack-200",
        success: "bg-green-700 border-green-800 text-gray-50 focus:ring-green-500/20 focus:ring-offset-nobelBlack-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean };
export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
