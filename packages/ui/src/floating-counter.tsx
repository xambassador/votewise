import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";

import { cn } from "./cn";

export const variants = cva(
  "absolute text-xs font-medium text-black-200 size-10 rounded-full bg-nobelBlack-100 border border-nobelBlack-200 flex items-center justify-center shadow-[0_4px_10px_0_rgba(0,0,0,40%)]",
  {
    variants: {
      variant: {
        topRight: "top-0 right-0",
        topLeft: "top-0 left-0",
        bottomRight: "bottom-0 right-0",
        bottomLeft: "bottom-0 left-0",
        leftCenter: "left-0 top-1/2 -translate-y-1/2",
        rightCenter: "right-0 top-1/2 -translate-y-1/2",
        center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      }
    },
    defaultVariants: {
      variant: "rightCenter"
    }
  }
);

export interface Props extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof variants> {}

export function FloatingCounter(props: Props) {
  const { className, children, variant, ...rest } = props;
  return (
    <div {...rest} className={cn(variants({ variant, className }))}>
      {children}
    </div>
  );
}
