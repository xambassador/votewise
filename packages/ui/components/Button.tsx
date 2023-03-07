import React from "react";
import type { ReactNode } from "react";

import { classNames } from "@votewise/lib";

type ButtonProps = {
  children?: ReactNode;
  primary?: boolean;
  secondary?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  const { className, children, primary = true, secondary, ...rest } = props;
  let classnames = "rounded-lg py-4 flex w-full items-center justify-center font-semibold";
  if (primary) {
    classnames += " bg-blue-500 text-blue-50 px-0";
  }

  if (secondary) {
    classnames += "bg-gray-50 text-gray-600 px-0 border border-gray-200";
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button className={classNames(classnames, className)} {...rest}>
      {children}
    </button>
  );
}
