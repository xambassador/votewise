"use client";

import type { TTellUsAboutYou } from "@/app/onboard/_utils/schema";
import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps, TFieldControllerProps } from "@votewise/ui/form";
import type { TextareaProps } from "@votewise/ui/textarea";
import type Link from "next/link";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { makeToast } from "@votewise/ui/toast";

import { ZTellUsAboutYou } from "@/app/onboard/_utils/schema";
import { onboard } from "@/app/onboard/action";

import { isObjectDirty } from "@/lib/object";
import { routes } from "@/lib/routes";

/* ----------------------------------------------------------------------------------------------- */

type LinkProps = React.ComponentProps<typeof Link>;
type HTMLFormProps = React.ComponentProps<"form">;
type Keys = keyof TTellUsAboutYou;

export function useStep(props: { defaultValue?: TTellUsAboutYou }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TTellUsAboutYou>({
    resolver: zodResolver(ZTellUsAboutYou),
    defaultValues: props.defaultValue
  });

  const action = form.handleSubmit((data) => {
    startTransition(async () => {
      const res = await onboard({ ...data, step: 2, isDirty: isObjectDirty(data, props.defaultValue || {}) });
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
    });
  });

  function getFormFieldProps(field: Keys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function getGenderFieldProps(): Omit<TFieldControllerProps<TTellUsAboutYou>, "render"> {
    return { name: "gender", control: form.control };
  }

  function getAboutFieldProps(props?: TextareaProps): TextareaProps {
    return { placeholder: "About yourself...", ...props, ...form.register("about") };
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Next", ...props, type: "submit", loading: isPending };
  }

  function getFormProps(props?: HTMLFormProps): HTMLFormProps {
    return { ...props, onSubmit: action };
  }

  function getBackButtonProps(props?: LinkProps): LinkProps {
    return { ...props, href: routes.onboard.step1() };
  }

  return {
    form,
    getFormFieldProps,
    getGenderFieldProps,
    getFormProps,
    getAboutFieldProps,
    getButtonProps,
    getBackButtonProps
  };
}
