"use client";

import { forwardRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./cn";

export const Tabs = TabsPrimitive.Root;

export type TabsListRef = React.ElementRef<typeof TabsPrimitive.List>;
export type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List>;
export const TabsList = forwardRef<TabsListRef, TabsListProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <TabsPrimitive.List
      {...rest}
      className={cn("flex items-center gap-4 border-b border-nobelBlack-200 tab-wrapper-width mx-auto", className)}
      ref={ref}
    />
  );
});
TabsList.displayName = "TabsList";

export type TabsTriggerRef = React.ElementRef<typeof TabsPrimitive.Trigger>;
export type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;
export const TabsTrigger = forwardRef<TabsTriggerRef, TabsTriggerProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <TabsPrimitive.Trigger
      {...rest}
      className={cn(
        "h-7 text-black-200 text-sm font-medium focus-primary focus-presets whitespace-nowrap rounded-sm",
        "data-[state=active]:border-b data-[state=active]:border-blue-600 data-[state=active]:text-blue-200 shadow-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      ref={ref}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

export type TabsContentRef = React.ElementRef<typeof TabsPrimitive.Content>;
export type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content>;
export const TabsContent = forwardRef<TabsContentRef, TabsContentProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <TabsPrimitive.Content {...rest} ref={ref} className={cn("mt-4 focus-primary focus-presets", props.className)} />
  );
});
TabsContent.displayName = "TabsContent";
