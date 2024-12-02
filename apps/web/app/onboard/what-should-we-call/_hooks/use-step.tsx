"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps } from "@votewise/ui/form";
import type { InputProps } from "@votewise/ui/input";
import type Link from "next/link";
import type { TStepOneForm, TStepOneFormKeys } from "../_utils";

import { useTransition } from "react";
import { chain } from "@/lib/chain";
import { routes } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";

import { ZStepOneFormSchema } from "../_utils";
import { onboard } from "../../action";

type LinkProps = React.ComponentProps<typeof Link>;

export function useStep() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TStepOneForm>({
    resolver: zodResolver(ZStepOneFormSchema)
  });

  const handleSubmit = form.handleSubmit(async () => {
    startTransition(async () => {
      await onboard({ redirectTo: routes.onboard.step2() });
    });
  });

  function getFormFieldProps(field: TStepOneFormKeys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function getInputProps(field: TStepOneFormKeys, props?: InputProps): InputProps {
    return { ...props, ...form.register(field) };
  }

  function getNextButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Next", ...props, onClick: chain(handleSubmit, props?.onClick), loading: isPending };
  }

  function getBackButtonProps(props?: LinkProps): LinkProps {
    return { ...props, href: "#", "aria-disabled": isPending };
  }

  return {
    form,
    handleSubmit,
    getFormFieldProps,
    getInputProps,
    getNextButtonProps,
    getBackButtonProps
  };
}
