import React from "react";

import { classNames } from "@votewise/lib";

function LoaderIcon({ height = "h-4", width = "w-4", color = "currentColor", className = "" }) {
  return (
    <svg
      className={classNames("animate-spin text-white", `${height} ${width}`, className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={color} strokeWidth="4" />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Loader({ className, loaderColor = "#fff" }: { className?: string; loaderColor?: string }) {
  return <LoaderIcon color={loaderColor} width="w-6" height="h-6" className={className} />;
}
