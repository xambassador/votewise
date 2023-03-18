import React from "react";
import type { ReactNode } from "react";

import { classNames } from "@votewise/lib";
import { FiX as CloseIcon } from "@votewise/ui/icons";

type ErrorMessageProps = {
  children: ReactNode;
  resetErrors: () => void;
} & React.HTMLAttributes<HTMLDivElement> & {
    errorMessageClassName?: string;
  } & {
    buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  };

export function ErrorMessage(props: ErrorMessageProps) {
  const { children, resetErrors, className, errorMessageClassName, buttonProps, ...rest } = props;
  return (
    <div className={classNames("mb-2 flex items-center justify-center text-red-600", className)} {...rest}>
      <p className={classNames("text-red-600", errorMessageClassName)}>{children}</p>
      <button
        type="button"
        onClick={resetErrors}
        className={classNames("ml-2", buttonProps?.className)}
        {...buttonProps}
      >
        <CloseIcon className="text-gray-500" />
      </button>
    </div>
  );
}
