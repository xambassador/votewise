import type { ReactNode } from "react";

import React from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

import classNames from "@votewise/lib/classnames";

type AlertProps = {
  children: ReactNode;
  type: "success" | "error" | "warning" | "info";
  showBorder?: boolean;
  accent?: boolean;
  className?: string;
} & {
  iconProps?: {
    className?: string;
  };
  iconWrapperProps?: React.HTMLAttributes<HTMLDivElement>;
} & {
  contentWrapperProps?: React.HTMLAttributes<HTMLDivElement>;
};

export function Alert(props: AlertProps) {
  const {
    className,
    children,
    type = "success",
    showBorder = true,
    accent = false,
    iconProps,
    iconWrapperProps,
    contentWrapperProps,
  } = props;

  return (
    <div className="relative">
      <div
        className={classNames(
          "flex items-center rounded-lg p-3",
          showBorder && "border",
          type === "success" && "border-green-200 bg-green-50",
          type === "error" && "border-red-200 bg-red-50",
          type === "warning" && "border-yellow-200 bg-yellow-50",
          type === "info" && "border-blue-200 bg-blue-50",
          accent && "border-l-4",
          className
        )}
      >
        <div {...iconWrapperProps}>
          {type === "success" && (
            <CheckCircleIcon className={classNames("h-6 w-6 text-green-500", iconProps?.className)} />
          )}
          {type === "error" && (
            <XCircleIcon className={classNames("h-6 w-6 text-red-500", iconProps?.className)} />
          )}
          {type === "warning" && (
            <ExclamationTriangleIcon
              className={classNames("h-6 w-6 text-yellow-500", iconProps?.className)}
            />
          )}
          {type === "info" && (
            <InformationCircleIcon className={classNames("h-6 w-6 text-blue-500", iconProps?.className)} />
          )}
        </div>
        <div
          className={classNames(
            type === "success" && "text-green-500",
            type === "error" && "text-red-500",
            type === "warning" && "text-yellow-500",
            type === "info" && "text-blue-500",
            "ml-3",
            contentWrapperProps?.className
          )}
          {...contentWrapperProps}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
