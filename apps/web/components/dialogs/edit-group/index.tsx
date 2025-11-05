"use client";

import type { Group } from "./edit-group";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";
import { Spinner } from "@votewise/ui/ring-spinner";

import { cn } from "@/lib/cn";

const LazyEditGroupDialog = dynamic(() => import("./edit-group").then((m) => m.EditGroup), {
  ssr: false,
  loading: () => (
    <div className="at-max-viewport overlay grid place-items-center fixed inset-0">
      <Spinner />
    </div>
  )
});

type Props = React.ComponentProps<typeof Button> & {
  group: Group;
};

export function EditGroup(props: Props) {
  const { group, ...rest } = props;
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad();
  return (
    <>
      <Button
        {...rest}
        className={cn("gap-2", props.className)}
        onClick={(e) => {
          trigger();
          setOpen(true);
          props.onClick?.(e);
        }}
      />
      {isLoaded() && <LazyEditGroupDialog open={open} onOpenChange={setOpen} group={group} />}
    </>
  );
}
