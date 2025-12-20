"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";

const load = () => import("./change-password");
const LazyChangePasswordDialog = dynamic(() => load().then((m) => m.ChangePassword), { ssr: false });

export function ChangePassword(props: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  return (
    <>
      <Button
        {...props}
        onFocus={loadAndTrigger}
        onMouseEnter={loadAndTrigger}
        onClick={(e) => {
          trigger();
          setOpen(true);
          props.onClick?.(e);
        }}
        aria-label="Change Password"
      >
        Change
      </Button>
      {isLoaded() && <LazyChangePasswordDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
