"use client";

import { forwardRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

import { cn } from "./cn";
import { Check } from "./icons/check";
import { ChevronDownTiny } from "./icons/chevron-down-tiny";
import { ChevronUpTiny } from "./icons/chevron-up-tiny";
import { inputWrapper } from "./theme";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

type SelectTriggerRef = React.ElementRef<typeof SelectPrimitive.Trigger>;
type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  hasError?: boolean;
};

export const SelectTrigger = forwardRef<SelectTriggerRef, SelectTriggerProps>((props, ref) => {
  const { className, children, hasError, ...rest } = props;
  const isError = hasError || !!props["data-has-error" as keyof typeof props];
  return (
    <SelectPrimitive.Trigger
      {...rest}
      ref={ref}
      className={cn(
        "justify-between [&>span]:line-clamp-1 text-sm sm:text-base",
        inputWrapper.base,
        isError && inputWrapper.error,
        className
      )}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownTiny />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

type SelectScrollUpButtonRef = React.ElementRef<typeof SelectPrimitive.ScrollUpButton>;
type SelectScrollUpButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>;

export const SelectScrollUpButton = forwardRef<SelectScrollUpButtonRef, SelectScrollUpButtonProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton
      ref={ref}
      className={cn("flex cursor-default items-center justify-center py-1 text-gray-400", className)}
      {...props}
    >
      <ChevronUpTiny />
    </SelectPrimitive.ScrollUpButton>
  )
);

type SelectScrollDownButtonRef = React.ElementRef<typeof SelectPrimitive.ScrollDownButton>;
type SelectScrollDownButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>;

export const SelectScrollDownButton = forwardRef<SelectScrollDownButtonRef, SelectScrollDownButtonProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollDownButton
      ref={ref}
      className={cn("flex cursor-default items-center justify-center py-1 text-gray-400", className)}
      {...props}
    >
      <ChevronDownTiny />
    </SelectPrimitive.ScrollDownButton>
  )
);

type SelectContentRef = React.ElementRef<typeof SelectPrimitive.Content>;
type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;

export const SelectContent = forwardRef<SelectContentRef, SelectContentProps>(
  ({ className, children, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative bg-nobelBlack-100 shadow-md border border-nobelBlack-200 z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "flex flex-col p-3 gap-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);

type SelectLabelRef = React.ElementRef<typeof SelectPrimitive.Label>;
type SelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;

export const SelectLabel = forwardRef<SelectLabelRef, SelectLabelProps>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold text-gray-400", className)}
    {...props}
  />
));

type SelectItemRef = React.ElementRef<typeof SelectPrimitive.Item>;
type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

export const SelectItem = forwardRef<SelectItemRef, SelectItemProps>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex p-2 text-sm sm:text-base rounded w-full select-none items-center text-gray-500 focus:bg-nobelBlack-200 transition-colors duration-300 cursor-pointer outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-5" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

type SelectSeparatorRef = React.ElementRef<typeof SelectPrimitive.Separator>;
type SelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;

export const SelectSeparator = forwardRef<SelectSeparatorRef, SelectSeparatorProps>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-nobelBlack-200", className)} {...props} />
));

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
SelectContent.displayName = SelectPrimitive.Content.displayName;
SelectLabel.displayName = SelectPrimitive.Label.displayName;
SelectItem.displayName = SelectPrimitive.Item.displayName;
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
