"use client";

import { forwardRef } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "./cn";
import { Cross } from "./icons/cross";

export type SheetProps = React.ComponentProps<typeof SheetPrimitive.Root>;

export function Sheet(props: SheetProps) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

export type SheetTriggerProps = React.ComponentProps<typeof SheetPrimitive.Trigger>;

export const SheetTrigger = forwardRef<React.ElementRef<typeof SheetPrimitive.Trigger>, SheetTriggerProps>(
  (props, ref) => <SheetPrimitive.Trigger data-slot="sheet-trigger" ref={ref} {...props} />
);
SheetTrigger.displayName = "SheetTrigger";

export type SheetCloseProps = React.ComponentProps<typeof SheetPrimitive.Close>;

export const SheetClose = forwardRef<React.ComponentRef<typeof SheetPrimitive.Close>, SheetCloseProps>((props, ref) => (
  <SheetPrimitive.Close data-slot="sheet-close" ref={ref} {...props} />
));
SheetClose.displayName = "SheetClose";

export type SheetPortalProps = React.ComponentProps<typeof SheetPrimitive.Portal>;

export function SheetPortal(props: SheetPortalProps) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

export type SheetOverlayProps = React.ComponentProps<typeof SheetPrimitive.Overlay>;

export const SheetOverlay = forwardRef<React.ComponentRef<typeof SheetPrimitive.Overlay>, SheetOverlayProps>(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay
      ref={ref}
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-nobelBlack-50/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
);
SheetOverlay.displayName = "SheetOverlay";

export type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
};

export function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 p-8 flex border-nobelBlack-200 flex-col focus:outline-none gap-4 shadow-lg bg-nobelBlack-100 data-[state=open]:animate-in data-[state=closed]:animate-out transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-lg",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded opacity-70 transition-opacity hover:opacity-100 focus-presets focus-primary focus:outline-hidden disabled:pointer-events-none">
          <Cross className="size-4 text-black-200" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

export type SheetHeaderProps = React.ComponentProps<"div">;

export function SheetHeader({ className, ...props }: SheetHeaderProps) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-3", className)} {...props} />;
}

export type SheetFooterProps = React.ComponentProps<"div">;

export function SheetFooter({ className, ...props }: SheetFooterProps) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

export type SheetTitleProps = React.ComponentProps<typeof SheetPrimitive.Title>;

export function SheetTitle({ className, ...props }: SheetTitleProps) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("font-semibold text-2xl text-gray-200", className)}
      {...props}
    />
  );
}

export type SheetDescriptionProps = React.ComponentProps<typeof SheetPrimitive.Description>;

export function SheetDescription({ className, ...props }: SheetDescriptionProps) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-gray-300", className)}
      {...props}
    />
  );
}
