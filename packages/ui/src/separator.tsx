import { forwardRef } from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./cn";

export function SeparatorWithLabel(props: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 h-px bg-black-400 rounded-full" />
      <span className="text-gray-400 text-xs">{props.children}</span>
      <div className="flex-1 h-px bg-black-400 rounded-full" />
    </div>
  );
}

type SeparatorRef = React.ElementRef<typeof SeparatorPrimitive.Root>;
type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

export const Separator = forwardRef<SeparatorRef, SeparatorProps>((props, ref) => {
  const { decorative, orientation, className, ...rest } = props;
  return (
    <SeparatorPrimitive.Root
      {...rest}
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-nobelBlack-200",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
    />
  );
});
Separator.displayName = "Separator";
