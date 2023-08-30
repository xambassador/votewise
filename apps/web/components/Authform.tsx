import { motion } from "framer-motion";

import Link from "next/link";
import { useRouter } from "next/router";

import React, { useState } from "react";
import type { ReactNode } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";

import {
  Alert,
  Button,
  Divider,
  EmailField,
  FacebookAuthButton,
  GoogleAuthButton,
  PasswordField,
  TwitterAuthButton,
} from "@votewise/ui";
import { FiX as CloseIcon, FiMail as Email, FiEyeOff as EyeOff, FiEye as EyeOn } from "@votewise/ui/icons";

import { axiosInstance } from "lib/axios";
import { useAsync } from "lib/hooks/useAsync";

type AuthFormProps = {
  title: string;
  subtitle: string | ReactNode;
  type?: "login" | "signup";
  showForgotPassword?: boolean;
  submitButtonLabel?: string;
};

type FormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
  apiError: string;
};

function Password() {
  const { register } = useFormContext<FormValues>();
  const [toggle, setToggle] = useState(false);

  return (
    <PasswordField
      label="Password"
      type={toggle ? "text" : "password"}
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
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2"
        type="button"
        onClick={() => setToggle(!toggle)}
      >
        {toggle && <EyeOn className="h-6 w-6 text-gray-500" />}
        {!toggle && <EyeOff className="h-6 w-6 text-gray-500" />}
      </button>
    </PasswordField>
  );
}

export function AuthForm(props: AuthFormProps) {
  const {
    title,
    subtitle,
    showForgotPassword = false,
    submitButtonLabel = "Sign Up",
    type = "signup",
  } = props;

  const { run, status } = useAsync({
    data: null,
    error: null,
    status: "idle",
  });
  const router = useRouter();
  const methods = useForm<FormValues>();
  const {
    register,
    formState: { errors },
    clearErrors,
  } = methods;

  const resetErrors = () => {
    clearErrors("apiError");
  };

  const authenticate: SubmitHandler<FormValues> = async (data) => {
    const url = type === "signup" ? "/auth/signup" : "/auth/signin";
    run(
      axiosInstance.post(url, data),
      () => {
        router.push("/onboarding");
      },
      (err: any) => {
        const msg = err.response?.data.error || "Something went wrong";
        methods.setError("apiError", { message: msg });
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="shadow-auth-form flex flex-col gap-7 rounded-lg bg-white p-10"
        onSubmit={methods.handleSubmit(authenticate)}
      >
        {errors.apiError && (
          <Alert
            type="error"
            showBorder={false}
            accent
            contentWrapperProps={{ className: "flex items-center justify-between w-full ml-3" }}
          >
            <p className="text-red-900">{errors.apiError.message}</p>
            <button type="button" onClick={resetErrors}>
              <CloseIcon className="text-gray-500" />
            </button>
          </Alert>
        )}
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
              <Email className="absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-500" />
            </EmailField>

            <Password />

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

          <Button
            primary
            isLoading={status === "pending"}
            disabled={(errors.apiError && true) || status === "pending"}
          >
            {submitButtonLabel}
          </Button>
        </div>

        <Divider>Or</Divider>

        <div className="flex flex-col gap-3">
          <GoogleAuthButton type="button" />
          <FacebookAuthButton type="button" />
          <TwitterAuthButton type="button" />
        </div>
      </motion.form>
    </FormProvider>
  );
}
