"use client";

import type { Props } from "@/components/error";

import ErrorBoundary from "@/components/error";

export default function Error(props: Props) {
  return (
    <div className="center min-h-screen">
      <ErrorBoundary {...props} className="w-fit" />
    </div>
  );
}
