"use client";

import { Toaster as _Toaster, toast } from "sonner";

import { cn } from "./cn";
import { CheckCircleSolid } from "./icons/check-circle-solid";
import { CrossCircleSolid } from "./icons/cross-circle-solid";

type Props = React.ComponentProps<typeof _Toaster>;

export function Toaster(props: Props) {
  return <_Toaster visibleToasts={2} expand className="min-w-[480px]" {...props} />;
}

function ThemedToast(props: { id: string | number; variant: "success" | "error"; title: string; message: string }) {
  const { id, variant, title, message } = props;
  return (
    <div
      className={cn(
        "p-4 rounded bg-nobelBlack-200 text-gray-200 border-l-2 w-full",
        variant === "success" && "border-green-400",
        variant === "error" && "border-red-400"
      )}
    >
      <div className="flex items-center gap-3">
        {variant === "success" && <CheckCircleSolid className="text-green-400" />}
        {variant === "error" && <CrossCircleSolid className="text-red-400" />}

        <div className="flex flex-col gap-1 max-w-[300px] min-w-[300px]">
          <span className="text-lg font-medium">{title}</span>
          <span className="text-base">{message}</span>
        </div>

        <button
          className="py-1 px-3 rounded hover:bg-nobelBlack-100 transition-colors text-xs text-gray-400 hover:text-gray-100"
          onClick={() => toast.dismiss(id)}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/**
 * Use this function to show toast message matches our design system.
 */
export const makeToast = {
  success: (title: string, message: string) => {
    const id = toast.custom((id) => <ThemedToast id={id} variant="success" title={title} message={message} />);
    return () => toast.dismiss(id);
  },
  error: (title: string, message: string) => {
    const id = toast.custom((id) => <ThemedToast id={id} variant="error" title={title} message={message} />);
    return () => toast.dismiss(id);
  }
};

export { toast };
