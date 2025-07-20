import { AlertCircleSolid } from "@votewise/ui/icons/alert-circle-solid";
import { Spinner } from "@votewise/ui/ring-spinner";

import { cn } from "@/lib/cn";

export const maxListItems = 3;

export const fallbackSpinner = (
  <div className="grid place-items-center h-24">
    <Spinner className="size-8" />
  </div>
);

export function ErrorMessage(props: { message: string }) {
  return (
    <div className="grid place-items-center h-24">
      <div className="flex flex-col items-center gap-1">
        <AlertCircleSolid className="text-red-500" />
        <span className="text-sm text-red-500 text-center">{props.message}</span>
      </div>
    </div>
  );
}

export function EmptyState(props: { message: string }) {
  return (
    <div className="grid place-items-center h-24">
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-gray-400 text-center">{props.message}</span>
      </div>
    </div>
  );
}

export function Title(props: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cn("text-sm font-medium text-gray-300", props.className)} />;
}

export function ContentWrapper(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex flex-col gap-3 pb-4 border-b border-nobelBlack-200", props.className)} />;
}

export function VerticalList(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("flex flex-col gap-4", props.className)} />;
}
