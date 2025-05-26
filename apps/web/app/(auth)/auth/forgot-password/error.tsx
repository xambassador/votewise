"use client";

import type { Props } from "@/components/error";

import Error from "@/components/error";

export default function ErrorBoundary(props: Props) {
  return (
    <div className="flex flex-col gap-7 min-w-[calc((450/16)*1rem)]">
      <Error {...props} />
    </div>
  );
}
