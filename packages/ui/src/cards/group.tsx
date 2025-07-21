"use client";

import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";

import { Badge } from "../badge";
import { cn } from "../cn";

export type GroupProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};
export const Group = forwardRef<HTMLDivElement, GroupProps>((props, ref) => {
  const { className, asChild = false, children, ...rest } = props;
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      {...rest}
      className={cn("flex flex-col gap-4 p-4 rounded-xl border border-nobelBlack-200 bg-nobelBlack-100", className)}
    >
      {children}
    </Comp>
  );
});
Group.displayName = "Group";

export type GroupHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupHeader = forwardRef<HTMLDivElement, GroupHeaderProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex items-start justify-between w-full", props.className)} />
));
GroupHeader.displayName = "GroupHeader";

export type GroupNameProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean;
};
export const GroupName = forwardRef<HTMLSpanElement, GroupNameProps>((props, ref) => {
  const { className, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : "span";
  return <Comp ref={ref} {...rest} className={cn("text-gray-200 text-lg break-words w-full max-w-[80%]", className)} />;
});
GroupName.displayName = "GroupName";

export type GroupDescriptionProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupDescription = forwardRef<HTMLSpanElement, GroupDescriptionProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-gray-300 text-sm", props.className)} />
));
GroupDescription.displayName = "GroupDescription";

type GroupStatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "children"> & { children?: string };
export const GroupStatusBadge = forwardRef<HTMLSpanElement, GroupStatusBadgeProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <Badge {...rest} ref={ref} variant="default" className={cn("text-xs", className)}>
      {children?.toLowerCase()}
    </Badge>
  );
});
GroupStatusBadge.displayName = "GroupStatusBadge";

export type GroupAuthorProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupAuthor = forwardRef<HTMLDivElement, GroupAuthorProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex items-center gap-2", props.className)} />
));
GroupAuthor.displayName = "GroupAuthor";

export type GroupTypeProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupType = forwardRef<HTMLSpanElement, GroupTypeProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-xs text-gray-300", props.className)} />
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
