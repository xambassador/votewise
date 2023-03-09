import { axioInstance } from "lib";
import Link from "next/link";

import React from "react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

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
  type?: "login" | "signup";
  showForgotPassword?: boolean;
  submitButtonLabel?: string;
};

type SignUpFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
  apiError: string;
};

export function AuthForm(props: AuthFormProps) {
  const {
    title,
    subtitle,
    showForgotPassword = false,
    submitButtonLabel = "Sign Up",
    type = "signup",
  } = props;

  const methods = useForm<SignUpFormValues>();
  const {
    register,
    formState: { errors },
  } = methods;

  const signUp: SubmitHandler<SignUpFormValues> = async (data) => {
    try {
      await axioInstance.post("/signup", data);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const msg = err.response.data.message || "Something went wrong";
      methods.setError("apiError", { message: msg });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className="shadow-auth-form flex flex-col gap-7 rounded-lg bg-white p-10"
        onSubmit={methods.handleSubmit(signUp)}
      >
        {errors.apiError && <p className="py-2 text-red-600">{errors.apiError.message}</p>}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
            <h3 className="mt-2 text-gray-600">{subtitle}</h3>
          </div>

          <div className="flex flex-col gap-5">
            <EmailField
              {...register("email", {
                required: "Email is required",
              })}
              label={type === "signup" ? "Email" : "Email or Username"}
              placeholder="johndoe@gmail.com"
              required
            >
              <Email className="absolute right-4 top-1/2 -translate-y-1/2" />
            </EmailField>
            <PasswordField
              label="Password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must have at least 8 characters",
                },
                maxLength: {
                  value: 20,
                  message: "Password must have at most 20 characters",
                },
              })}
            >
              <EyeOff className="absolute right-4 top-1/2 -translate-y-1/2" />
            </PasswordField>

            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="mr-1 rounded"
                  {...register("rememberMe")}
                />
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
    </FormProvider>
  );
}
