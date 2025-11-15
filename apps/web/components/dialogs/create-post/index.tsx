"use client";

import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";
import { Pencil } from "@votewise/ui/icons/pencil";

import { useCreatePostDialog } from "./store";

const load = () => import("./lazy-dialog");
const LazyCreatePostDialog = dynamic(() => load().then((mod) => mod.LazyCreatePostDialog), { ssr: false });

export function CreatePostDialog() {
  const { getDialogProps, getButtonProps } = useCreatePostDialog();
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  return (
    <>
      <Button
        {...getButtonProps({
          className: "w-fit gap-1",
          onMouseEnter: loadAndTrigger,
          onFocus: loadAndTrigger,
          onClick: trigger
        })}
      >
        <Pencil className="text-gray-200" />
        <span>Share Idea</span>
      </Button>
      {isLoaded() && <LazyCreatePostDialog {...getDialogProps()} />}
    </>
  );
}
