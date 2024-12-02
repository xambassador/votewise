import type { ButtonProps } from "@votewise/ui/button";
import type { EmailInputProps } from "@votewise/ui/email-input";
import type { FormFieldProps } from "@votewise/ui/form";
import type { PasswordHintTooltipProps } from "@votewise/ui/password-hint-tooltip";
import type { PasswordInputProps } from "@votewise/ui/password-input";
import type { PasswordStrengthProps } from "@votewise/ui/password-strength";
import type { TSignUpForm, TSignUpFormKeys } from "../_utils";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";

import { ZSignUpForm } from "../_utils";

export function useSignupBase() {
  const form = useForm<TSignUpForm>({
    resolver: zodResolver(ZSignUpForm),
    defaultValues: { email: "", password: "" }
  });

  const handleSubmit = form.handleSubmit(() => {});

  return { handleSubmit, form };
}

export function useSignup() {
  const { form, handleSubmit } = useSignupBase();
  const password = form.watch("password");

  function getPasswordStrengthProps(): PasswordStrengthProps {
    return { password };
  }

  function getPasswordHintTooltipProps(props?: PasswordHintTooltipProps): PasswordHintTooltipProps {
    return { password, ...props };
  }

  function getSubmitButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Let’s Do This!", ...props, onClick: handleSubmit };
  }

  function getEmailInputProps(props?: EmailInputProps): EmailInputProps {
    return { placeholder: "Enter your email address", ...props, ...form.register("email") };
  }

  function getPasswordInputProps(props?: PasswordInputProps): PasswordInputProps {
    return { placeholder: "Choose your password", ...props, ...form.register("password") };
  }

  function getFormFieldProps(field: TSignUpFormKeys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  return {
    getSubmitButtonProps,
    form,
    getEmailInputProps,
    getPasswordInputProps,
    getFormFieldProps,
    getPasswordStrengthProps,
    getPasswordHintTooltipProps
  };
}
