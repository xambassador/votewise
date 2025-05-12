"use client";

import { Error } from "@votewise/ui/error";

type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
};

export default function ErrorBoundary(props: Props) {
  const { error } = props;
  return (
    <div className="flex flex-col gap-7 min-w-[calc((450/16)*1rem)]">
      <Error error={error.message} errorInfo={{ componentStack: error.stack }} />
    </div>
  );
}
