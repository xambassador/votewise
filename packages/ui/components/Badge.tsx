import React from "react";
import type { ReactNode } from "react";

import { classNames } from "@votewise/lib";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  type: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
};

export function Badge({ children, type, className }: BadgeProps) {
  let classes =
    "bg-gray-800 py-[2px] px-[10px] text-sm text-gray-400 h-fit flex rounded-full items-center justify-center";
  switch (type) {
    case "success":
      classes = classNames(classes, "bg-green-200 text-green-800");
      break;
    case "danger":
      classes = classNames(classes, "bg-red-100 text-red-800");
      break;
    case "warning":
      classes = classNames(classes, "bg-orange-200 text-orange-700");
      break;
    default:
      break;
  }
  return <span className={classNames(classes, className)}>{children}</span>;
}
