import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";

import { cn } from "@/lib/cn";

const load = () => import("./create-group");
const LazyCreateGroupDialog = dynamic(() => load().then((m) => m.CreateGroup), { ssr: false });

export function CreateGroup(props: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  return (
    <>
      <Button
        {...props}
        className={cn("gap-2", props.className)}
        onFocus={loadAndTrigger}
        onMouseEnter={loadAndTrigger}
        onClick={(e) => {
          trigger();
          setOpen(true);
          props.onClick?.(e);
        }}
      >
        Create
      </Button>
      {isLoaded() && <LazyCreateGroupDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
