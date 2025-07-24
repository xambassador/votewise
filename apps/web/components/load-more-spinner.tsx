import { Spinner } from "@votewise/ui/ring-spinner";

import { cn } from "@/lib/cn";

export function LoadMoreSpinner(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("flex items-center justify-center", props.className)}>
      <Spinner className="size-5" />
    </div>
  );
}
