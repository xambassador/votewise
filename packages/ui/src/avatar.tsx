"use client";

import { forwardRef } from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "./cn";

type AvatarRef = React.ElementRef<typeof AvatarPrimitive.Root>;
export type AvatarProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & { isOnline?: boolean };

export const Avatar = forwardRef<AvatarRef, AvatarProps>(({ className, isOnline, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "flex h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-red-200 bg-nobelBlack-100",
      isOnline && "border-green-600",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

type AvatarImageRef = React.ElementRef<typeof AvatarPrimitive.Image>;
export type AvatarImageProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>;

export const AvatarImage = forwardRef<AvatarImageRef, AvatarImageProps>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover overflow-clip-margin-unset", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

type AvatarFallbackRef = React.ElementRef<typeof AvatarPrimitive.Fallback>;
export type AvatarFallbackProps = React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & { name?: string };

function createFallbackName(name: string) {
  const nameParts = name.split(" ");
  const initials = nameParts.map((part) => part.charAt(0).toUpperCase()).join("");
  return initials;
}

export const AvatarFallback = forwardRef<AvatarFallbackRef, AvatarFallbackProps>(
  ({ className, name, children, ...props }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-nobelBlack-200 border-2 border-nobelBlack-50",
        className
      )}
      {...props}
    >
      {name ? createFallbackName(name) : children}
    </AvatarPrimitive.Fallback>
  )
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
