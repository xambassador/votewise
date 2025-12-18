"use client";

import type { Group } from "./edit-group";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";

import { cn } from "@/lib/cn";

const load = () => import("./edit-group");
const LazyEditGroupDialog = dynamic(() => load().then((m) => m.EditGroup), { ssr: false });

type Props = React.ComponentProps<typeof Button> & { group: Group };

export function EditGroup(props: Props) {
  const { group, ...rest } = props;
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  return (
    <>
      <Button
        {...rest}
        className={cn("gap-2 rounded-full size-8", props.className)}
        onMouseEnter={loadAndTrigger}
        onFocus={loadAndTrigger}
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
