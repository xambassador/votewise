"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";

const load = () => import("./disable-mfa");
const LazyDisableMFADialog = dynamic(() => load().then((m) => m.DisableMFA), { ssr: false });

export function DisableMFA(props: React.ComponentProps<typeof Button> & { factorId: string }) {
  const { factorId, ...buttonProps } = props;
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  return (
    <>
      <Button
        {...buttonProps}
        onFocus={loadAndTrigger}
        onMouseEnter={loadAndTrigger}
        onClick={(e) => {
          trigger();
          setOpen(true);
          buttonProps.onClick?.(e);
        }}
      />
      {isLoaded() && (
        <LazyDisableMFADialog open={open} onOpenChange={setOpen} factorId={factorId}>
          <Button className="w-full sm:w-fit" size="md" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </LazyDisableMFADialog>
      )}
    </>
  );
}
