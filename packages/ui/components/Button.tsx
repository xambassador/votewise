import React from "react";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------------------
import { classNames } from "@votewise/lib";

// -----------------------------------------------------------------------------------------
type ButtonProps = {
  children?: ReactNode;
  primary?: boolean;
  secondary?: boolean;
  tritertiary?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function getThemeClasses(theme: "primary" | "secondary" | "tritertiary") {
  let classnames = "rounded-lg py-4 flex w-full items-center justify-center font-semibold";
  if (theme === "primary") {
    classnames += " bg-blue-500 text-blue-50 px-0";
  }

  if (theme === "secondary") {
    classnames += "bg-gray-50 text-gray-600 px-0 border border-gray-200";
  }

  if (theme === "tritertiary") {
    classnames += " bg-black text-gray-50 rounded-full";
  }

  return classnames;
}

export function Button(props: ButtonProps) {
  const { className, children, primary = true, secondary, ...rest } = props;
  // eslint-disable-next-line no-nested-ternary
  const classnames = primary
    ? getThemeClasses("primary")
    : secondary
    ? getThemeClasses("secondary")
    : getThemeClasses("tritertiary");
  return (
    // eslint-disable-next-line react/button-has-type
    <button className={classNames(classnames, className)} {...rest}>
      {children}
    </button>
  );
}
