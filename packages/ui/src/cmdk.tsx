"use client";

import { Command as Cmdk } from "cmdk";

import { cn } from "./cn";
import { Input } from "./input";
import { Separator } from "./separator";

export type CommandProps = React.ComponentProps<typeof Cmdk>;
export function Command(props: CommandProps) {
  const { className, ...rest } = props;
  return (
    <Cmdk
      data-slot="command"
      {...rest}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-nobelBlack-100 text-gray-200",
        className
      )}
    />
  );
}

export type CommandInputProps = React.ComponentProps<typeof Cmdk.Input> & {
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
};
export function CommandInput(props: CommandInputProps) {
  const { className, wrapperProps, ...rest } = props;
  return (
    <div data-slot="command-input-wrapper" {...wrapperProps} className={cn("p-4", wrapperProps?.className)}>
      <Cmdk.Input data-slot="command-input" {...rest} asChild className={cn("w-full", className)}>
        <Input />
      </Cmdk.Input>
    </div>
  );
}

export type CommandListProps = React.ComponentProps<typeof Cmdk.List>;
export function CommandList(props: CommandListProps) {
  const { className, ...rest } = props;
  return (
    <Cmdk.List
      data-slot="command-list"
      className={cn("px-4 max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
      {...rest}
    />
  );
}

export type CommandEmptyProps = React.ComponentProps<typeof Cmdk.Empty>;
export function CommandEmpty(props: CommandEmptyProps) {
  const { className, ...rest } = props;
  return (
    <Cmdk.Empty
      data-slot="command-empty"
      className={cn("text-sm text-black-300 text-center py-5", className)}
      {...rest}
    />
  );
}

export type CommandGroupProps = React.ComponentProps<typeof Cmdk.Group>;
export function CommandGroup(props: CommandGroupProps) {
  const { className, ...rest } = props;
  return (
    <Cmdk.Group
      data-slot="command-group"
      className={cn(
        "text-black-200 [&_[cmdk-group-heading]]:text-black-300 overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...rest}
    />
  );
}

export type CommandSeparatorProps = React.ComponentProps<typeof Cmdk.Separator>;
export function CommandSeparator(props: CommandSeparatorProps) {
  const { className, ...rest } = props;
  return (
    <Cmdk.Separator asChild data-slot="command-separator" className={cn("-mx-1 h-px w-full", className)} {...rest}>
      <Separator />
    </Cmdk.Separator>
  );
}

export type CommandItemProps = React.ComponentProps<typeof Cmdk.Item>;
export function CommandItem(props: CommandItemProps) {
  const { className, ...rest } = props;
  return (
    <Cmdk.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-nobelBlack-200 data-[selected=true]:text-blue-200 [&_svg:not([class*='text-'])]:text-gray-300 relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...rest}
    />
  );
}
