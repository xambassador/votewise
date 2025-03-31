"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps } from "@votewise/ui/form";
import type { InputProps } from "@votewise/ui/input";
import type Link from "next/link";
import type { TWhatShouldWeCall } from "../../_utils/schema";

import { useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { zodResolver } from "@hookform/resolvers/zod";

import { User } from "@votewise/client/user";
import { useForm } from "@votewise/ui/form";

import { chain } from "@/lib/chain";
import { client } from "@/lib/client";

import { ZWhatShouldWeCall } from "../../_utils/schema";
import { onboard } from "../../action";

type LinkProps = React.ComponentProps<typeof Link>;
type Keys = keyof TWhatShouldWeCall;

const user = new User({ client });

export function useStep(props: { defaultValues?: TWhatShouldWeCall }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<TWhatShouldWeCall>({
    resolver: zodResolver(ZWhatShouldWeCall),
    defaultValues: props.defaultValues
  });

  const username = form.watch("userName");
  const debouncedUsername = useDebounce(username);

  useEffect(() => {
    const isErrorSet = !!form.formState.errors.userName;
    if (debouncedUsername) {
      user.isUsernameAvailable(debouncedUsername).then((res) => {
        if (!res.success) {
          form.setError("userName", { message: res.error });
        } else if (isErrorSet) {
          form.clearErrors("userName");
        }
      });
    }

    if (debouncedUsername === "" && isErrorSet) {
      form.clearErrors("userName");
    }
  }, [debouncedUsername, form]);

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(() => {
      onboard({ ...data, step: 1 });
    });
  });

  function getFormFieldProps(field: Keys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function getInputProps(field: Keys, props?: InputProps): InputProps {
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
