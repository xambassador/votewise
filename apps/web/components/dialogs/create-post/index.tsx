"use client";

import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";
import { createPortal } from "react-dom";

import { Button } from "@votewise/ui/button";
import { Pencil } from "@votewise/ui/icons/pencil";
import { Spinner } from "@votewise/ui/ring-spinner";

import { useCreatePostDialog } from "./store";

const id = "share-idea-btn";

const LazyCreatePostDialog = dynamic(() => import("./lazy-dialog").then((mod) => mod.LazyCreatePostDialog), {
  ssr: false,
  loading: () => <>{createPortal(<Spinner className="size-4" />, document.getElementById(id)!)}</>
});
const load = () => import("./lazy-dialog");

export function CreatePostDialog() {
  const { getDialogProps, getButtonProps } = useCreatePostDialog();
  const { isLoaded, trigger } = useLazyLoad();
  return (
    <>
      <Button
        {...getButtonProps({
          className: "w-fit gap-1",
          onMouseEnter: load,
          onFocus: load,
          onClick: trigger,
          id
        })}
      >
        <Pencil className="text-gray-200" />
        <span>Share Idea</span>
      </Button>
      {isLoaded() && <LazyCreatePostDialog {...getDialogProps()} />}
    </>
  );
}
