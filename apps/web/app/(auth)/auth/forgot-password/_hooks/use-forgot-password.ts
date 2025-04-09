"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { EmailInputProps } from "@votewise/ui/email-input";
import type { FormFieldProps } from "@votewise/ui/form";
import type { TForgotPasswordForm, TForgotPasswordFormKeys } from "../_utils";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";

import { ZForgotPasswordForm } from "../_utils";

export function useForgotPassword() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TForgotPasswordForm>({
    resolver: zodResolver(ZForgotPasswordForm),
    defaultValues: { email: "" }
  });

  const handleSubmit = form.handleSubmit(() => {
    startTransition(() => {});
  });

  function getEmailInputProps(props?: EmailInputProps): EmailInputProps {
    return { placeholder: "Enter your email address", ...props, ...form.register("email") };
  }

  function getSubmitButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Get reset link", ...props, onClick: handleSubmit, disabled: isPending, loading: isPending };
  }

  function getFormFieldProps(field: TForgotPasswordFormKeys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  return { form, getEmailInputProps, getSubmitButtonProps, getFormFieldProps };
}
