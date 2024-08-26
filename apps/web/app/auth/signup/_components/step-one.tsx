import { Fragment } from "react";

import { EmailInput } from "@votewise/ui/email-input";
import { FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { PasswordHintTooltip } from "@votewise/ui/password-hint-tooltip";
import { PasswordInput } from "@votewise/ui/password-input";
import { PasswordStrength } from "@votewise/ui/password-strength";

import { usePasswordStrength, useStepOne } from "../_hooks/use-signup";

export function StepOneForm() {
  const { getPasswordInputProps, getEmailInputProps, getFormFieldProps, render } = useStepOne();
  const { getPasswordStrengthProps, getPasswordHintTooltipProps } = usePasswordStrength();

  return render(
    <Fragment>
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
    </Fragment>
  );
}
