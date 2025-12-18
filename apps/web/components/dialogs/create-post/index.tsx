"use client";

import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";
import { useMediaQuery } from "react-responsive";

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
          className: "w-fit gap-1 hidden xl:flex min-w-36",
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

export function CreatePostMobile() {
  const isMobile = useMediaQuery({ query: "(max-width: 1280px)" });
  const { getDialogProps, getButtonProps } = useCreatePostDialog();
  const { isLoaded, trigger } = useLazyLoad({ requiredForceUpdate: true });
  const loadAndTrigger = () => load().then(trigger);
  if (!isMobile) return null;
  return (
    <>
      <Button
        {...getButtonProps({
          className: "fixed bottom-6 right-6 z-50 rounded-full px-0 size-16 shadow-lg",
          onMouseEnter: loadAndTrigger,
          onFocus: loadAndTrigger,
          onClick: trigger
        })}
      >
        <Pencil className="text-gray-200" />
        <span className="sr-only">Share Idea</span>
      </Button>
      {isLoaded() && <LazyCreatePostDialog {...getDialogProps()} />}
    </>
  );
}
