"use client";

import type { Props } from "@/components/error";

import Error from "@/components/error";

export default function ErrorBoundary(props: Props) {
  return (
    <div className="flex flex-col gap-10 sm:w-fit w-full">
      <Error {...props} className="w-full max-w-full sm:min-w-[calc((450/16)*1rem)] sm:max-w-[calc((450/16)*1rem)]" />
    </div>
  );
}
