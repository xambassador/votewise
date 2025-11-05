import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";
import { Spinner } from "@votewise/ui/ring-spinner";

import { cn } from "@/lib/cn";

const LazyCreateGroupDialog = dynamic(() => import("./create-group").then((m) => m.CreateGroup), {
  ssr: false,
  loading: () => (
    <div className="at-max-viewport overlay grid place-items-center fixed inset-0">
      <Spinner />
    </div>
  )
});

export function CreateGroup(props: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad();
  return (
    <>
      <Button
        {...props}
        className={cn("gap-2", props.className)}
        onClick={(e) => {
          trigger();
          setOpen(true);
          props.onClick?.(e);
        }}
      />
      {isLoaded() && <LazyCreateGroupDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
