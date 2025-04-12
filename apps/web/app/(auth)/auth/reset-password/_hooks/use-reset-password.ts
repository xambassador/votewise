"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps } from "@votewise/ui/form";
import type { PasswordHintTooltipProps } from "@votewise/ui/password-hint-tooltip";
import type { PasswordInputProps } from "@votewise/ui/password-input";
import type { PasswordStrengthProps } from "@votewise/ui/password-strength";
import type { TResetPasswordForm, TResetPasswordFormKeys } from "../_utils";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { ZResetPasswordSchema } from "../_utils";
import { resetPassword } from "../action";

export function useResetPassword() {
  const form = useForm<TResetPasswordForm>({
    resolver: zodResolver(ZResetPasswordSchema),
    defaultValues: { password: "" }
  });
  const token = useSearchParams().get("token");
  const [isPending, startTransition] = useTransition();
  const password = form.watch("password");

  const handleSubmit = form.handleSubmit(({ password }) => {
    startTransition(async () => {
      if (!token) return;
      const res = await resetPassword({ password, token });
      if (!res.success) makeToast.error("Oops!", res.error);
    });
  });

  function getPasswordStrengthProps(): PasswordStrengthProps {
    return { password };
  }

  function getPasswordHintTooltipProps(props?: PasswordHintTooltipProps): PasswordHintTooltipProps {
    return { password, ...props };
  }

  function getSubmitButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Submit", ...props, onClick: handleSubmit, disabled: isPending, loading: isPending };
  }

  function getPasswordInputProps(props?: PasswordInputProps): PasswordInputProps {
    return { placeholder: "Choose your password", ...props, ...form.register("password") };
  }

  function getFormFieldProps(field: TResetPasswordFormKeys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  return {
    form,
    getPasswordStrengthProps,
    getPasswordHintTooltipProps,
    getSubmitButtonProps,
    getPasswordInputProps,
    getFormFieldProps
  };
}
