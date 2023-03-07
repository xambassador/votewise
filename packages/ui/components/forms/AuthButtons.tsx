import React from "react";
import type { ReactNode } from "react";

import { classNames } from "@votewise/lib";

import { Facebook, Google, Twitter } from "../../icons";

type AuthButtonProps = {
  children?: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function AuthButton(props: AuthButtonProps) {
  const { className, children, ...rest } = props;
  return (
    <button
      className={classNames(
        "flex items-center justify-center gap-3 rounded-lg border border-gray-200 py-4 text-sm font-bold text-gray-600",
        className
      )}
      type="submit"
      {...rest}
    >
      {children}
    </button>
  );
}

export function GoogleAuthButton(props: AuthButtonProps) {
  return (
    <AuthButton {...props}>
      <span>
        <Google />
      </span>
      <span>Sign up with Google</span>
    </AuthButton>
  );
}

export function FacebookAuthButton(props: AuthButtonProps) {
  return (
    <AuthButton {...props}>
      <span>
        <Facebook />
      </span>
      <span>Sign up with Facebook</span>
    </AuthButton>
  );
}

export function TwitterAuthButton(props: AuthButtonProps) {
  return (
    <AuthButton {...props}>
      <span>
        <Twitter />
      </span>
      <span>Sign up with Twitter</span>
    </AuthButton>
  );
}
