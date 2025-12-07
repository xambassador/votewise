"use client";

import { Button } from "./button";
import { cn } from "./cn";
import { AlertCircleSolid } from "./icons/alert-circle-solid";
import { RotateRightIcon } from "./icons/rotate-right";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  error: string;
  errorInfo?: React.ErrorInfo | null;
  resetErrorBoundary?: () => void;
  shellProps?: React.HTMLAttributes<HTMLDivElement>;
  iconProps?: React.SVGProps<SVGSVGElement>;
  iconWrapperProps?: React.HTMLAttributes<HTMLDivElement>;
};

const isDevMode = process.env.NODE_ENV === "development";

export function Error(props: Props) {
  const { error, errorInfo, resetErrorBoundary, shellProps, iconProps, iconWrapperProps, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center justify-center size-full", rest.className)}>
      <div
        {...shellProps}
        className={cn(
          "w-full bg-nobelBlack-100 rounded-lg shadow-xl overflow-hidden border border-black-400",
          shellProps?.className
        )}
      >
        <div className="p-6">
          <div
            {...iconWrapperProps}
            className={cn(
              "flex items-center justify-center size-16 mx-auto mb-4 rounded-full bg-black-400/50 text-orange-50",
              iconWrapperProps?.className
            )}
          >
            <AlertCircleSolid {...iconProps} className={cn("size-8", iconProps?.className)} />
          </div>

          <h2 className="mb-2 text-lg font-bold text-center text-gray-200">Well, This Is Embarrassing...</h2>

          <div className="mb-6 text-center text-gray-300">
            <p className="mb-4 text-base">
              The hamsters powering this section have gone on strike. Union negotiations in progress.
            </p>
            {isDevMode && (
              <div className="mt-4 p-3 bg-black-800 rounded-md text-left overflow-auto">
                <p className="text-sm font-mono text-gray-300 mb-2">{error}</p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">Stack trace</summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-black-900 rounded border border-black-600 text-gray-400">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            {!isDevMode && (
              <div className="mt-4 p-3 bg-black-800 rounded-md text-left">
                <p className="text-sm font-mono text-gray-300 mb-2">
                  Something went wrong. Try again or come back later.
                </p>
              </div>
            )}
          </div>

          {resetErrorBoundary && (
            <Button onClick={resetErrorBoundary} className="w-full group">
              <RotateRightIcon className="mr-2 group-hover:rotate-[-60deg] transition-transform group-hover:transition-transform group-active:rotate-0 duration-300 group-hover:duration-300" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
