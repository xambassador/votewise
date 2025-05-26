"use client";

import type { Props } from "@/components/error";

import Error from "@/components/error";

export default function ErrorBoundary(props: Props) {
  return (
    <div className="flex flex-col gap-10 max-w-[calc((420/16)*1rem)] w-full">
      <Error {...props} />
    </div>
  );
}
