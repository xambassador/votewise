"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useLazyLoad } from "@/hooks/use-lazy-load";

import { InforCircleSolid } from "@votewise/ui/icons/info-circle-solid";
import { Spinner } from "@votewise/ui/ring-spinner";

const LazyMembersSheet = dynamic(() => import("./members").then((mod) => mod.Members), {
  ssr: false,
  loading: () => <Spinner className="size-4" />
});
const load = () => import("./members");

export function MembersSheet(props: { groupId: string; name: string; about: string }) {
  const { groupId, name, about } = props;

  const [open, setOpen] = useState(false);
  const { isLoaded, trigger } = useLazyLoad();

  return (
    <div className="flex items-center gap-1">
      {isLoaded() && (
        <LazyMembersSheet groupId={groupId} open={open} onOpenChange={setOpen} about={about} name={name} />
      )}
      <button
        className="focus-presets focus-primary flex items-center gap-1 rounded"
        onClick={() => {
          trigger();
          setOpen(true);
        }}
        onFocus={load}
        onMouseEnter={load}
      >
        <InforCircleSolid className="text-blue-300 size-5" />
        <span className="font-medium text-blue-300 text-sm">About</span>
      </button>
    </div>
  );
}
