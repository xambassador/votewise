"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";

const load = () => import("./setup-mfa");
const LazySetupMFADialog = dynamic(() => load().then((m) => m.SetupMFA), { ssr: false });

export function SetupMFA(
  props: React.ComponentProps<typeof Button> & {
    dialogProps: Omit<React.ComponentProps<typeof LazySetupMFADialog>, "dialogProps">;
  }
) {
  const { dialogProps, ...buttonProps } = props;
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
        <LazySetupMFADialog
          isLoading={buttonProps.loading}
          dialogProps={{ open, onOpenChange: setOpen }}
          {...dialogProps}
        >
          <Button className="w-full sm:w-fit" size="md" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </LazySetupMFADialog>
      )}
    </>
  );
}
