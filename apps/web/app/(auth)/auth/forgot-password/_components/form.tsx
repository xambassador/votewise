"use client";

import { Button } from "@votewise/ui/button";
import { EmailInput } from "@votewise/ui/email-input";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";

import { useForgotPassword } from "../_hooks/use-forgot-password";

export function ForgotPasswordForm() {
  const { form, getFormFieldProps, getSubmitButtonProps, getEmailInputProps } = useForgotPassword();

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-7 min-w-[calc((450/16)*1rem)] max-w-[calc((450/16)*1rem)]">
        <Form {...form}>
          <FormField {...getFormFieldProps("email")}>
            <FormLabel>Your email</FormLabel>
            <FormControl>
              <EmailInput {...getEmailInputProps()} />
            </FormControl>
            <FormMessage />
          </FormField>
        </Form>
      </div>
      <div className="flex items-center justify-between">
        <Button {...getSubmitButtonProps()} />
      </div>
    </div>
  );
}
