"use client";

import type { TWhatShouldWeCall } from "@/app/onboard/_utils/schema";
import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps } from "@votewise/ui/form";
import type { InputProps } from "@votewise/ui/input";
import type Link from "next/link";

import { useEffect, useTransition } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { zodResolver } from "@hookform/resolvers/zod";

import { User } from "@votewise/client/user";
import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { ZWhatShouldWeCall } from "@/app/onboard/_utils/schema";
import { onboard } from "@/app/onboard/action";

import { chain } from "@/lib/chain";
import { client } from "@/lib/client";
import { isObjectDirty } from "@/lib/object";

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
    const isDirty = isObjectDirty(data, props.defaultValues || {});
    startTransition(async () => {
      const res = await onboard({
        step: 1,
        user_name: data.userName,
        last_name: data.lastName,
        first_name: data.firstName,
        isDirty
      });
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
    });
  });

  function getFormFieldProps(field: Keys, props?: FormFieldProps): FormFieldProps {
    return { ...props, name: field };
  }

  function getInputProps(field: Keys, props?: InputProps): InputProps {
    return { ...props, ...form.register(field) };
  }

  function getNextButtonProps(props?: ButtonProps): ButtonProps {
    const hasError = Object.keys(form.formState.errors).length > 0;
    return {
      children: "Next",
      ...props,
      onClick: chain(handleSubmit, props?.onClick),
      loading: isPending,
      disabled: isPending || hasError
    };
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
