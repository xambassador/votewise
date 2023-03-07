import Link from "next/link";

import React from "react";
import type { ReactNode } from "react";

import {
  Button,
  Divider,
  Email,
  EmailField,
  EyeOff,
  FacebookAuthButton,
  GoogleAuthButton,
  PasswordField,
  TwitterAuthButton,
} from "@votewise/ui";

type AuthFormProps = {
  title: string;
  subtitle: string | ReactNode;
  showForgotPassword?: boolean;
  submitButtonLabel?: string;
};

export function AuthForm(props: AuthFormProps) {
  const { title, subtitle, showForgotPassword = false, submitButtonLabel = "Sign Up" } = props;
  return (
    <form className="shadow-auth-form flex flex-col gap-7 rounded-lg bg-white p-10">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <h3 className="mt-2 text-gray-600">{subtitle}</h3>
        </div>

        <div className="flex flex-col gap-5">
          <EmailField name="email" label="Email" placeholder="johndoe@gmail.com">
            <Email className="absolute right-4 top-1/2 -translate-y-1/2" />
          </EmailField>
          <PasswordField name="password" label="Password">
            <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2" />
          </PasswordField>

          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <input type="checkbox" id="remember-me" className="mr-1 rounded" />
              <label htmlFor="remember-me" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            {showForgotPassword && (
              <Link className="text-sm text-blue-600" href="/forgot-password">
                Forgot password?
              </Link>
            )}
          </div>
        </div>

        <Button primary>{submitButtonLabel}</Button>
      </div>

      <Divider>Or</Divider>

      <div className="flex flex-col gap-3">
        <GoogleAuthButton />
        <FacebookAuthButton />
        <TwitterAuthButton />
      </div>
    </form>
  );
}
