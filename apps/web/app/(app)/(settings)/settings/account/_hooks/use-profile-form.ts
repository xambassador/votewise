"use client";

import type { GetMyAccountResponse } from "@votewise/client/user";
import type { TUpdateAccount } from "@votewise/schemas/user";
import type { ButtonProps } from "@votewise/ui/button";
import type { FormFieldProps } from "@votewise/ui/form";

import { useUpdateAccountMutation } from "@/hooks/use-update-account-mutation";
import { zodResolver } from "@hookform/resolvers/zod";

import { ZUpdateAccount } from "@votewise/schemas/user";
import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";

type Props = { account: GetMyAccountResponse };

export type TFormFields = keyof TUpdateAccount;

export function useProfileForm(props: Props) {
  const form = useForm<TUpdateAccount>({
    resolver: zodResolver(ZUpdateAccount),
    defaultValues: {
      email: props.account.email,
      username: props.account.user_name,
      first_name: props.account.first_name,
      last_name: props.account.last_name,
      about: props.account.about || "",
      location: props.account.location || "",
      facebook: props.account.facebook_url || "",
      instagram: props.account.instagram_url || "",
      twitter: props.account.twitter_url || ""
    }
  });

  const mutation = useUpdateAccountMutation();

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data, {
      onError: (err) => makeToast.error("Failed to update profile", err.message),
      onSuccess: () => makeToast.success("Success!", "Profile updated successfully")
    });
  });

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: chain(props?.onClick, handleSubmit),
      loading: mutation.isPending,
      disabled: !form.formState.isDirty
    };
  }

  function getFormFieldProps<T extends TFormFields>(name: T, props?: Omit<FormFieldProps, "name">): FormFieldProps {
    return { ...props, name };
  }

  return { getButtonProps, form, getFormFieldProps };
}
