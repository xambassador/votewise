"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { Profile } from "./update-profile";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";
import { Pencil } from "@votewise/ui/icons/pencil";

import { cn } from "@/lib/cn";

const load = () => import("./update-profile");
const LazyUpdateProfileDialog = dynamic(() => load().then((m) => m.UpdateProfile), { ssr: false });

type Props = React.ComponentProps<typeof Button> & { profile: Profile };

export function UpdateProfile(props: Props) {
  const { profile, ...rest } = props;
  const { getButtonProps, getDialogProps, isLoaded } = useUpdateProfile();
  return (
    <>
      <Button {...getButtonProps(rest)}>
        <Pencil className="size-4" />
        <span className="sr-only">{rest.children}</span>
      </Button>
      {isLoaded() && <LazyUpdateProfileDialog {...getDialogProps(profile)} />}
    </>
  );
}

function useUpdateProfile() {
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onFocus: loadAndTrigger,
      onMouseEnter: loadAndTrigger,
      onClick: (e) => {
        trigger();
        setOpen(true);
        props?.onClick?.(e);
      },
      className: cn("gap-1 px-1 rounded-full size-8", props?.className)
    };
  }

  function getDialogProps(profile: Profile) {
    return { open, onOpenChange: setOpen, profile };
  }

  return { getButtonProps, isLoaded, getDialogProps };
}
