import type { Button } from "@votewise/ui/button";
import type { EmailInput } from "@votewise/ui/email-input";
import type { FormField } from "@votewise/ui/form";
import type { Input } from "@votewise/ui/input";
import type { PasswordHintTooltip } from "@votewise/ui/password-hint-tooltip";
import type { PasswordInput } from "@votewise/ui/password-input";
import type { PasswordStrength } from "@votewise/ui/password-strength";
import type { TStepOneForm, TStepOneFormKeys, TStepTwoForm, TStepTwoFormKeys } from "../_utils";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm, useFormContext } from "@votewise/ui/form";

import { ZStepOneFormSchema, ZStepTwoFormSchema } from "../_utils";
import { useFormAtom, useGetSteps, useStepsAtom } from "../_utils/store";

type InputProps = React.ComponentProps<typeof Input>;
type ButtonProps = React.ComponentProps<typeof Button>;
type FormFieldProps = React.ComponentProps<typeof FormField>;
type EmailInputProps = React.ComponentProps<typeof EmailInput>;
type PasswordInputProps = React.ComponentProps<typeof PasswordInput>;
type PasswordStrengthProps = React.ComponentProps<typeof PasswordStrength>;
type PasswordHintTooltipProps = React.ComponentProps<typeof PasswordHintTooltip>;

export function useSignupBase() {
  const [steps, setSteps] = useStepsAtom();
  const [formStore, setFormStore] = useFormAtom();

  const stepOneForm = useForm<TStepOneForm>({
    resolver: zodResolver(ZStepOneFormSchema),
    defaultValues: { email: "", password: "" }
  });
  const stepTwoForm = useForm<TStepTwoForm>({
    resolver: zodResolver(ZStepTwoFormSchema)
  });

  const form = { stepOneForm, stepTwoForm };

  const stepOneHandler = stepOneForm.handleSubmit((data) => {
    setSteps(2);
    setFormStore((prev) => ({ ...prev, ...data }));
  });
  const stepTwoHandler = stepTwoForm.handleSubmit((data) => {
    const finalData = { ...formStore, ...data };
    setFormStore(finalData);
  });

  const backDisabled = steps === 1;

  function onNext() {
    if (steps === 1) {
      stepOneHandler();
      return;
    }

    stepTwoHandler();
  }

  function onBack() {
    if (steps === 2) {
      setSteps(1);
    }
  }

  return { backDisabled, steps, form, onNext, onBack };
}

export function useSignup() {
  const { steps, onNext, onBack, backDisabled, form } = useSignupBase();

  function getBackButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Back", ...props, variant: "secondary", onClick: onBack, disabled: backDisabled };
  }

  function getNextButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Next", ...props, onClick: onNext };
  }

  function getStapLabelContent() {
    return `Step ${steps} of 2`;
  }

  return { getBackButtonProps, getStapLabelContent, getNextButtonProps, form };
}

export function useStepOne() {
  const steps = useGetSteps();
  const form = useFormContext<TStepOneForm>();

  function getEmailInputProps(props?: EmailInputProps): EmailInputProps {
    return { placeholder: "Enter your email address", ...props, ...form.register("email") };
  }

  function getPasswordInputProps(props?: PasswordInputProps): PasswordInputProps {
    return { placeholder: "Choose your password", ...props, ...form.register("password") };
  }

  function getFormFieldProps(field: TStepOneFormKeys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function render(children: React.ReactNode) {
    if (steps !== 1) return null;
    return children;
  }

  return {
    getEmailInputProps,
    getPasswordInputProps,
    getFormFieldProps,
    render
  };
}

export function usePasswordStrength() {
  const form = useFormContext<TStepOneForm>();
  const password = form.watch("password");

  function getPasswordStrengthProps(): PasswordStrengthProps {
    return { password };
  }

  function getPasswordHintTooltipProps(props?: PasswordHintTooltipProps): PasswordHintTooltipProps {
    return { password, ...props };
  }

  return { getPasswordStrengthProps, getPasswordHintTooltipProps };
}

export function useStepTwo() {
  const steps = useGetSteps();
  const form = useFormContext<TStepTwoForm>();

  function getUserNameInputProps(props?: InputProps): InputProps {
    return { placeholder: "Choose your username", ...props, ...form.register("userName") };
  }

  function getFirstNameInputProps(props?: InputProps): InputProps {
    return { placeholder: "Enter your first name", ...props, ...form.register("firstName") };
  }

  function getLastNameInputProps(props?: InputProps): InputProps {
    return { placeholder: "Enter your last name", ...props, ...form.register("lastName") };
  }

  function getFormFieldProps(field: TStepTwoFormKeys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function render(children: React.ReactNode) {
    if (steps !== 2) return null;
    return children;
  }

  return {
    getFormFieldProps,
    render,
    getUserNameInputProps,
    getFirstNameInputProps,
    getLastNameInputProps
  };
}
