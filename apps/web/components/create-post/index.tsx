"use client";

import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { Button } from "@votewise/ui/button";
import { Pencil } from "@votewise/ui/icons/pencil";
import { Spinner } from "@votewise/ui/ring-spinner";

import { useCreatePostDialog } from "./store";

const LazyCreatePostDialog = dynamic(() => import("./lazy-dialog").then((mod) => mod.LazyCreatePostDialog), {
  ssr: false,
  loading: () => (
    <div className="at-max-viewport overlay grid place-items-center fixed inset-0">
      <Spinner />
    </div>
  )
});
const load = () => import("./lazy-dialog");

export function CreatePostDialog() {
  const { getDialogProps, getButtonProps } = useCreatePostDialog();
  const { isLoaded, trigger } = useLazyLoad();
  return (
    <>
      <Button {...getButtonProps({ className: "w-fit gap-1", onMouseEnter: load, onFocus: load, onClick: trigger })}>
        <Pencil className="text-gray-200" />
        <span>Share Idea</span>
      </Button>
      {isLoaded() && <LazyCreatePostDialog {...getDialogProps()} />}
    </>
  );
}
