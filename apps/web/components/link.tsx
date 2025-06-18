"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

type props = React.ComponentProps<typeof NextLink>;

export function Link(props: props) {
  const { className, ...rest } = props;
  const pathname = usePathname();
  const isActive = props.href === pathname;
  return (
    <NextLink
      {...rest}
      data-active={isActive}
      className={cn(
        "py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors text-sm font-medium",
        isActive ? "text-blue-200" : "text-black-200",
        className
      )}
    />
  );
}
