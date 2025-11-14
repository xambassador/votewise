"use client";

import type { Profile } from "./update-profile";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";
import { Spinner } from "@votewise/ui/ring-spinner";

import { cn } from "@/lib/cn";

const LazyUpdateProfileDialog = dynamic(() => import("./update-profile").then((m) => m.UpdateProfile), {
  ssr: false,
  loading: () => (
    <div className="at-max-viewport overlay grid place-items-center fixed inset-0">
      <Spinner />
    </div>
  )
});

type Props = React.ComponentProps<typeof Button> & {
  profile: Profile;
};

export function UpdateProfile(props: Props) {
  const { profile, ...rest } = props;
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
      {isLoaded() && <LazyUpdateProfileDialog open={open} onOpenChange={setOpen} profile={profile} />}
    </>
  );
}
