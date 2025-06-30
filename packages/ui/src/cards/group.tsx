"use client";

import { forwardRef } from "react";

import { Badge } from "../badge";
import { Button } from "../button";
import { cn } from "../cn";
import { AlertTriangle } from "../icons/alert-triangle";

export type GroupProps = React.HTMLAttributes<HTMLDivElement>;
export const Group = forwardRef<HTMLDivElement, GroupProps>((props, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      "flex flex-col gap-4 p-4 rounded-xl border border-nobelBlack-200 bg-nobelBlack-100 min-w-[calc((280/16)*1rem)]",
      props.className
    )}
  />
));
Group.displayName = "Group";

export type GroupHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupHeader = forwardRef<HTMLDivElement, GroupHeaderProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex items-center justify-between", props.className)} />
));
GroupHeader.displayName = "GroupHeader";

export type GroupNameProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupName = forwardRef<HTMLSpanElement, GroupNameProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-gray-100 text-lg", props.className)} />
));
GroupName.displayName = "GroupName";

type GroupStatusBadgeProps = React.ComponentProps<typeof Badge>;
export const GroupStatusBadge = forwardRef<HTMLSpanElement, GroupStatusBadgeProps>((props, ref) => (
  <Badge {...props} ref={ref} className={cn("text-xs", props.className)} />
));
GroupStatusBadge.displayName = "GroupStatusBadge";

export type GroupAuthorProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupAuthor = forwardRef<HTMLDivElement, GroupAuthorProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex items-center gap-2", props.className)} />
));
GroupAuthor.displayName = "GroupAuthor";

export type GroupTypeProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupType = forwardRef<HTMLSpanElement, GroupTypeProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-xs text-gray-400", props.className)} />
));
GroupType.displayName = "GroupType";

export type GroupMembersProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupMembers = forwardRef<HTMLDivElement, GroupMembersProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex -space-x-3 relative", props.className)} />
));
GroupMembers.displayName = "GroupMembers";

export type GroupCreatedAtProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupCreatedAt = forwardRef<HTMLSpanElement, GroupCreatedAtProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-xs text-gray-400", props.className)} />
));
GroupCreatedAt.displayName = "GroupCreatedAt";

export type GroupAuthorNameProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupAuthorName = forwardRef<HTMLSpanElement, GroupAuthorNameProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-gray-200 text-sm", props.className)} />
));
GroupAuthorName.displayName = "GroupAuthorName";

export type GroupAuthorHandleProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupAuthorHandle = forwardRef<HTMLSpanElement, GroupAuthorHandleProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-gray-400 text-xs", props.className)} />
));
GroupAuthorHandle.displayName = "GroupAuthorHandle";

export type GroupActionButtonProps = React.ComponentProps<typeof Button> & { isClosed?: boolean };
export const GroupActionButton = forwardRef<HTMLButtonElement, GroupActionButtonProps>((props, ref) => {
  const { isClosed, children = "Closed. Time to explore new ideas!", ...rest } = props;
  if (isClosed) {
    return (
      <Button ref={ref} {...rest} variant="outline" disabled className={cn("gap-2", props.className)}>
        <AlertTriangle className="size-5" />
        {children}
      </Button>
    );
  }
  return (
    <Button ref={ref} {...rest} className={cn("gap-2", props.className)}>
      {children}
    </Button>
  );
});
GroupActionButton.displayName = "GroupActionButton";
