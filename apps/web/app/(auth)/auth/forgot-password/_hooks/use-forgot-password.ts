"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { EmailInputProps } from "@votewise/ui/email-input";
import type { FormFieldProps } from "@votewise/ui/form";
import type { TForgotPasswordForm, TForgotPasswordFormKeys } from "../_utils";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { routes } from "@/lib/routes";

import { ZForgotPasswordForm } from "../_utils";
import { forgotPassword } from "../action";

export function useForgotPassword() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const form = useForm<TForgotPasswordForm>({
    resolver: zodResolver(ZForgotPasswordForm),
    defaultValues: { email: "" }
  });

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(() => {
      forgotPassword(data).then((res) => {
        if (!res.success) {
          makeToast.error("Oops!", res.error);
        } else {
          router.push(routes.auth.signIn());
        }
      });
    });
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
