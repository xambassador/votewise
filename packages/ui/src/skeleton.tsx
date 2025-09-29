import { forwardRef, isValidElement } from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "./cn";

type SkeletonElement = React.ElementRef<"span">;
type SkeletonProps = React.ComponentPropsWithoutRef<"span"> & { loading?: boolean };

export const Skeleton = forwardRef<SkeletonElement, SkeletonProps>((props, ref) => {
  const { children, className, loading = true, ...rest } = props;
  if (!loading) return children;
  const Tag = isValidElement(children) ? Slot : "span";
  return (
    <Tag
      ref={ref}
      aria-hidden
      className={cn(
        "bg-nobelBlack-200 rounded select-none cursor-default pointer-events-none text-transparent leading-[0]",
        className
      )}
      data-inline-skeleton={isValidElement(children) ? undefined : true}
      tabIndex={-1}
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      inert={false}
      {...rest}
    >
      {children}
    </Tag>
  );
});

Skeleton.displayName = "Skeleton";
