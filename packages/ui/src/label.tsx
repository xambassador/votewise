"use client";

import { forwardRef } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./cn";

const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-lg w-fit text-gray-300 font-normal peer-disabled:cursor-not-allowed", className)}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
