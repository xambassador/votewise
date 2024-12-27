"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

import { Button, variants } from "@votewise/ui/button";

type Props = {
  nextProps?: React.ComponentProps<typeof Button>;
  backProps?: React.ComponentProps<typeof Link>;
} & React.HTMLAttributes<HTMLDivElement>;

export function Footer(props: Props) {
  const { nextProps, backProps, ...rest } = props;
  return (
    <div {...rest} className={cn("flex flex-col gap-5", rest.className)}>
      <Button {...nextProps}>{nextProps?.children || "Next"}</Button>
      <Link href="" {...backProps} className={cn(variants({ variant: "secondary" }), backProps?.className)}>
        {backProps?.children || "Back"}
      </Link>
      {rest.children}
    </div>
  );
}
