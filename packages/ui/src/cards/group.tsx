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
      className={cn("p-4 rounded-xl border border-nobelBlack-200 bg-nobelBlack-100", className)}
    >
      {children}
    </Comp>
  );
});
Group.displayName = "Group";

export type GroupContentProps = React.HTMLAttributes<HTMLDivElement> & {
  asChild?: boolean;
};
export const GroupContent = forwardRef<HTMLDivElement, GroupContentProps>((props, ref) => {
  const { className, asChild = false, children, ...rest } = props;
  const Comp = asChild ? Slot : "div";
  return (
    <Comp ref={ref} {...rest} className={cn("flex flex-col gap-1 w-full", className)}>
      {children}
    </Comp>
  );
});
GroupContent.displayName = "GroupContent";

export type GroupHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupHeader = forwardRef<HTMLDivElement, GroupHeaderProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex items-center justify-between w-full", props.className)} />
));
GroupHeader.displayName = "GroupHeader";

export type GroupNameProps = React.HTMLAttributes<HTMLSpanElement> & {
  asChild?: boolean;
};
export const GroupName = forwardRef<HTMLSpanElement, GroupNameProps>((props, ref) => {
  const { className, asChild = false, ...rest } = props;
  const Comp = asChild ? Slot : "span";
  return <Comp ref={ref} {...rest} className={cn("text-gray-200 text-lg break-words", className)} />;
});
GroupName.displayName = "GroupName";

export type GroupDescriptionProps = React.HTMLAttributes<HTMLSpanElement>;
export const GroupDescription = forwardRef<HTMLSpanElement, GroupDescriptionProps>((props, ref) => (
  <span ref={ref} {...props} className={cn("text-gray-300 text-sm", props.className)} />
));
GroupDescription.displayName = "GroupDescription";

type GroupStatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "children"> & {
  children?: string | React.ReactNode;
};
export const GroupStatusBadge = forwardRef<HTMLSpanElement, GroupStatusBadgeProps>((props, ref) => {
  const { className, children, ...rest } = props;
  return (
    <Badge {...rest} ref={ref} variant="default" className={cn("text-xs", className)}>
      {typeof children === "string" ? children?.toLowerCase() : children}
    </Badge>
  );
});
GroupStatusBadge.displayName = "GroupStatusBadge";

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

export type GroupFooterProps = React.HTMLAttributes<HTMLDivElement>;
export const GroupFooter = forwardRef<HTMLDivElement, GroupFooterProps>((props, ref) => (
  <div ref={ref} {...props} className={cn("flex items-center justify-between w-full mt-4", props.className)} />
));
GroupFooter.displayName = "GroupFooter";
