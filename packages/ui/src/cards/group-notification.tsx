"use client";

import { forwardRef } from "react";

import { cn } from "../cn";
import { Clock } from "../icons/clock";

export type NotificationProps = React.HTMLAttributes<HTMLDivElement>;
type NotificationRef = HTMLDivElement;

export const Notification = forwardRef<NotificationRef, NotificationProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className={cn("p-4 bg-nobelBlack-100 border border-nobelBlack-200 rounded-xl", className)}>
      {children}
    </div>
  );
});
Notification.displayName = "Notification";

export type NotificationContentProps = React.HTMLAttributes<HTMLDivElement>;
type NotificationContentRef = HTMLDivElement;

export const NotificationContent = forwardRef<NotificationContentRef, NotificationContentProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className={cn("flex items-start gap-3", className)}>
      {children}
    </div>
  );
});
NotificationContent.displayName = "NotificationContent";

export type NotificationHeaderProps = React.HTMLAttributes<HTMLDivElement>;
type NotificationHeaderRef = HTMLDivElement;

export const NotificationHeader = forwardRef<NotificationHeaderRef, NotificationHeaderProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className={cn("flex items-start justify-between flex-wrap w-full gap-2", className)}>
      {children}
    </div>
  );
});
NotificationHeader.displayName = "NotificationHeader";

export type NotificationTextProps = React.HTMLAttributes<HTMLParagraphElement>;
type NotificationTextRef = HTMLParagraphElement;

export const NotificationText = forwardRef<NotificationTextRef, NotificationTextProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <p ref={ref} {...rest} className={cn("text-black-100 text-base max-w-[80%]", className)}>
      {children}
    </p>
  );
});
NotificationText.displayName = "NotificationText";

export type NotificationDateProps = React.HTMLAttributes<HTMLSpanElement>;
type NotificationDateRef = HTMLSpanElement;

export const NotificationDate = forwardRef<NotificationDateRef, NotificationDateProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <span ref={ref} {...rest} className={cn("flex items-center gap-1 text-gray-400 text-xs w-fit", className)}>
      <Clock />
      {children}
    </span>
  );
});
NotificationDate.displayName = "NotificationDate";

export type NotificationActionsProps = React.HTMLAttributes<HTMLDivElement>;
type NotificationActionsRef = HTMLDivElement;

export const NotificationActions = forwardRef<NotificationActionsRef, NotificationActionsProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <div ref={ref} {...rest} className={cn("flex items-center gap-3", className)}>
      {children}
    </div>
  );
});
NotificationActions.displayName = "NotificationActions";
