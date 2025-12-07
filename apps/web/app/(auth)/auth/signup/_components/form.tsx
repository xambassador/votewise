"use client";

import { Fragment } from "react";

import { Button } from "@votewise/ui/button";
import { EmailInput } from "@votewise/ui/email-input";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { PasswordHintTooltip } from "@votewise/ui/password-hint-tooltip";
import { PasswordInput } from "@votewise/ui/password-input";
import { PasswordStrength } from "@votewise/ui/password-strength";

import { useSignup } from "../_hooks/use-signup";

export function SignupForm() {
  const {
    form,
    getSubmitButtonProps,
    getFormFieldProps,
    getEmailInputProps,
    getPasswordInputProps,
    getPasswordHintTooltipProps,
    getPasswordStrengthProps
  } = useSignup();

  return (
    <Fragment>
      <div className="flex flex-col gap-7 w-full">
        <h4 className="hidden lg:block lg:text-lg text-base font-semibold">Your account</h4>
        <div className="flex flex-col gap-7 w-full sm:min-w-[calc((450/16)*1rem)] sm:max-w-[calc((450/16)*1rem)]">
          <Form {...form}>
            <FormField {...getFormFieldProps("email")}>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <EmailInput {...getEmailInputProps()} />
              </FormControl>
              <FormMessage />
            </FormField>
            <FormField {...getFormFieldProps("password")}>
              <FormLabel>Password</FormLabel>
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
      </div>
      <div className="flex items-center justify-between">
        <Button {...getSubmitButtonProps({ className: "w-full" })} />
      </div>
    </Fragment>
  );
}
