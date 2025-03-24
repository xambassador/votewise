"use client";

import type { TConnectYourSocials } from "@/app/onboard/_utils/schema";
import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { ZConnectYourSocials } from "@/app/onboard/_utils/schema";
import { onboard } from "@/app/onboard/action";

import { chain } from "@/lib/chain";
import { routes } from "@/lib/routes";

type LinkProps = React.ComponentProps<typeof Link>;
type FormProps = React.ComponentProps<"form">;
type Props = { defaultValues?: TConnectYourSocials };

export function useStep(props?: Props) {
  const { defaultValues } = props || {};
  const [isPending, startTransition] = useTransition();
  const form = useForm<TConnectYourSocials>({
    resolver: zodResolver(ZConnectYourSocials),
    defaultValues
  });

  function onSubmit(data: TConnectYourSocials) {
    startTransition(async () => {
      const res = await onboard({ step: 5, ...data });
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
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
