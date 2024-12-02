"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";
import { chain } from "@/lib/chain";
import { routes } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useForm } from "@votewise/ui/form";

import { onboard } from "../../action";

const schema = z.object({
  location: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional()
});

type LinkProps = React.ComponentProps<typeof Link>;
type FormProps = React.ComponentProps<"form">;
type TSchema = z.infer<typeof schema>;

export function useStep() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TSchema>({
    resolver: zodResolver(schema)
  });

  function onSubmit() {
    startTransition(async () => {
      await onboard({ redirectTo: "/" });
    });
  }

  function getFormProps(props?: FormProps): FormProps {
    return { ...props, onSubmit: form.handleSubmit(chain(onSubmit, props?.onSubmit)) };
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { ...props, type: "submit", loading: isPending };
  }

  function getBackProps(props?: LinkProps): LinkProps {
    return { ...props, href: routes.onboard.step4() };
  }

  return { form, getFormProps, getButtonProps, getBackProps };
}

export type { TSchema };
