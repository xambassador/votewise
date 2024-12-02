"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps, TFieldControllerProps } from "@votewise/ui/form";
import type { TextareaProps } from "@votewise/ui/textarea";
import type Link from "next/link";

import { useTransition } from "react";
import { routes } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { onboard } from "../../action";

/* ----------------------------------------------------------------------------------------------- */

const schema = z.object({
  gender: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  about: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" })
});

type LinkProps = React.ComponentProps<typeof Link>;
type HTMLFormProps = React.ComponentProps<"form">;
type Schema = z.infer<typeof schema>;
type Keys = keyof Schema;

export function useStep() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<Schema>({
    resolver: zodResolver(schema)
  });

  const action = form.handleSubmit(() => {
    startTransition(async () => {
      await onboard({ redirectTo: routes.onboard.step3() });
    });
  });

  function getFormFieldProps(field: Keys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function getGenderFieldProps(): Omit<TFieldControllerProps<Schema>, "render"> {
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
