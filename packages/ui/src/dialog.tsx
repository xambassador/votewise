"use client";

import { forwardRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "./cn";
import { Cross } from "./icons/cross";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

type DialogOverlayRef = React.ElementRef<typeof DialogPrimitive.Overlay>;
type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;

const DialogOverlay = forwardRef<DialogOverlayRef, DialogOverlayProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <DialogPrimitive.Overlay
      {...rest}
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-nobelBlack-50/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentRef = React.ElementRef<typeof DialogPrimitive.Content>;
type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  overlayProps?: React.ComponentPropsWithoutRef<typeof DialogOverlay>;
};

export const DialogContent = forwardRef<DialogContentRef, DialogContentProps>((props, ref) => {
  const { className, children, overlayProps, ...rest } = props;
  return (
    <DialogPortal>
      <DialogOverlay {...overlayProps} />
      <DialogPrimitive.Content
        {...rest}
        ref={ref}
        className={cn(
          "fixed left-[50%] bg-nobelBlack-100 border border-nobelBlack-200 top-[50%] z-50 grid w-full max-w-3xl rounded-3xl translate-x-[-50%] translate-y-[-50%] gap-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus-visible:outline-0 focus:outline-0",
          className
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 text-gray-400", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

type DialogTitleRef = React.ElementRef<typeof DialogPrimitive.Title>;
type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;

export const DialogTitle = forwardRef<DialogTitleRef, DialogTitleProps>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-gray-500", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

type DialogDescriptionRef = React.ElementRef<typeof DialogPrimitive.Description>;
type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>;

export const DialogDescription = forwardRef<DialogDescriptionRef, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground text-gray-400", className)}
      {...props}
    />
  )
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

type CloseRef = React.ElementRef<typeof DialogPrimitive.Close>;
type CloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> & {
  iconProps?: React.ComponentPropsWithoutRef<typeof Cross>;
};

export const Close = forwardRef<CloseRef, CloseProps>((props, ref) => {
  const { className, iconProps, ...rest } = props;
  return (
    <DialogPrimitive.Close {...rest} ref={ref} className={cn("absolute top-5 text-black-300 right-5", className)}>
      <Cross {...iconProps} className={cn("size-4", iconProps?.className)} />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  );
});

Close.displayName = DialogPrimitive.Close.displayName;
