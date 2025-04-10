"use client";

import { Button } from "@votewise/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { PasswordHintTooltip } from "@votewise/ui/password-hint-tooltip";
import { PasswordInput } from "@votewise/ui/password-input";
import { PasswordStrength } from "@votewise/ui/password-strength";

import { useResetPassword } from "../_hooks/use-reset-password";

export function ResetPasswordForm() {
  const {
    form,
    getFormFieldProps,
    getPasswordHintTooltipProps,
    getPasswordInputProps,
    getPasswordStrengthProps,
    getSubmitButtonProps
  } = useResetPassword();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-7 min-w-[calc((450/16)*1rem)] max-w-[calc((450/16)*1rem)]">
        <Form {...form}>
          <FormField {...getFormFieldProps("password")}>
            <FormLabel>New password</FormLabel>
            <FormControl>
              <PasswordInput {...getPasswordInputProps()} />
            </FormControl>
            <FormMessage />
            <div className="flex items-center justify-between">
              <PasswordStrength {...getPasswordStrengthProps()} />
              <PasswordHintTooltip {...getPasswordHintTooltipProps()} />
            </div>
          </FormField>
        </Form>
      </div>
      <div className="flex items-center justify-between">
        <Button {...getSubmitButtonProps()} />
      </div>
    </div>
  );
}
