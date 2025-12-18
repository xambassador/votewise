"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useLazyLoad } from "@/hooks/use-lazy-load";
import { useMediaQuery } from "react-responsive";

import { Button } from "@votewise/ui/button";
import { Plus } from "@votewise/ui/icons/plus";

import { cn } from "@/lib/cn";

const load = () => import("./create-group");
const LazyCreateGroupDialog = dynamic(() => load().then((m) => m.CreateGroup), { ssr: false });

export function CreateGroup(props: React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  const pathname = usePathname();
  if (!pathname.startsWith("/groups/my")) {
    return null;
  }
  return (
    <>
      <Button
        {...props}
        className={cn("w-fit gap-1 hidden xl:flex min-w-36", props.className)}
        variant="secondary"
        onFocus={loadAndTrigger}
        onMouseEnter={loadAndTrigger}
        onClick={(e) => {
          trigger();
          setOpen(true);
          props.onClick?.(e);
        }}
      >
        Create Group
      </Button>
      {isLoaded() && <LazyCreateGroupDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}

export function CreateGroupMobile(props: React.ComponentProps<typeof Button>) {
  const isMobile = useMediaQuery({ query: "(max-width: 1280px)" });
  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  if (!isMobile) return null;
  return (
    <>
      <Button
        className={cn("fixed bottom-24 right-6 z-50 rounded-full px-0 size-16 shadow-lg", props.className)}
        variant="secondary"
        onFocus={loadAndTrigger}
        onMouseEnter={loadAndTrigger}
        onClick={(e) => {
          trigger();
          setOpen(true);
          props.onClick?.(e);
        }}
      >
        <Plus className="text-gray-200" />
        <span className="sr-only">Create Group</span>
      </Button>
      {isLoaded() && <LazyCreateGroupDialog open={open} onOpenChange={setOpen} />}
    </>
  );
}
