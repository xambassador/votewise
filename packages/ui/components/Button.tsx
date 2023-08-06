import React from "react";
import type { ReactNode } from "react";

// -----------------------------------------------------------------------------------------
import classNames from "@votewise/lib/classnames";

import { Loader } from "./Loader";

// -----------------------------------------------------------------------------------------
type ButtonProps = {
  children?: ReactNode;
  primary?: boolean;
  secondary?: boolean;
  tritertiary?: boolean;
  dark?: boolean;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loaderProps?: React.ComponentProps<typeof Loader>;
  };

function getThemeClasses(theme: "primary" | "secondary" | "tritertiary" | "dark") {
  let classnames =
    "rounded-lg py-4 flex w-full items-center justify-center font-semibold disabled:cursor-not-allowed disabled:bg-blue-300";
  if (theme === "primary") {
    classnames += " bg-blue-500 text-blue-50 px-0";
    return classnames;
  }

  if (theme === "secondary") {
    classnames += " bg-gray-50 text-gray-600 px-0 border border-gray-200";
    return classnames;
  }

  if (theme === "tritertiary") {
    classnames += " bg-black text-gray-50 rounded-full";
    return classnames;
  }

  if (theme === "dark") {
    classnames += " bg-gray-800 py-4 text-gray-50 disabled:bg-gray-800";
  }

  return classnames;
}

export function Button(props: ButtonProps) {
  const {
    className,
    children,
    primary,
    secondary,
    tritertiary,
    dark,
    isLoading,
    loaderProps,
    disabled,
    ...rest
  } = props;

  let classnames;
  if (primary) classnames = getThemeClasses("primary");
  else if (secondary) classnames = getThemeClasses("secondary");
  else if (tritertiary) classnames = getThemeClasses("tritertiary");
  else if (dark) classnames = getThemeClasses("dark");
  else classnames = getThemeClasses("primary");

  return (
    // eslint-disable-next-line react/button-has-type
    <button className={classNames(classnames, className)} disabled={disabled || isLoading} {...rest}>
      {isLoading && <Loader {...loaderProps} />}
      {!isLoading && children}
    </button>
  );
}
