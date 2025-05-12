"use client";

import { Button } from "./button";
import { cn } from "./cn";
import { AlertCircleSolid } from "./icons/alert-circle-solid";
import { RotateRightIcon } from "./icons/rotate-right";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  error: string;
  errorInfo?: React.ErrorInfo | null;
  resetErrorBoundary?: () => void;
};

const isDevMode = process.env.NODE_ENV === "development";

export function Error(props: Props) {
  const { error, errorInfo, resetErrorBoundary, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center justify-center size-full p-6", rest.className)}>
      <div className="w-full max-w-md bg-nobelBlack-100 rounded-lg shadow-xl overflow-hidden border border-black-400">
        <div className="p-6">
          <div className="flex items-center justify-center size-16 mx-auto mb-4 rounded-full bg-black-500 text-orange-50">
            <AlertCircleSolid className="size-8" />
          </div>

          <h2 className="mb-2 text-2xl font-bold text-center text-gray-100">Well, This Is Embarrassing...</h2>

          <div className="mb-6 text-center text-gray-300">
            <p className="mb-4">
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

          <Button onClick={resetErrorBoundary} className="w-full group">
            <RotateRightIcon className="mr-2 group-hover:rotate-[-60deg] transition-transform group-hover:transition-transform group-active:rotate-0 duration-300 group-hover:duration-300" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
