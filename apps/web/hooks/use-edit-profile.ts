"use client";

import type { TUpdateProfile } from "@votewise/schemas/user";
import type { ButtonProps } from "@votewise/ui/button";
import type { DialogProps } from "@votewise/ui/dialog";
import type { FormFieldProps, TFieldControllerProps, TFormProps } from "@votewise/ui/form";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { ZUpdateProfile } from "@votewise/schemas/user";
import { useForm } from "@votewise/ui/form";

import { chain } from "@/lib/chain";

import { useUpdateProfileMutation } from "./use-update-profile-mutation";

type Profile = {
  id: string;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  firstName: string;
  lastName: string;
  about: string;
};

export function useEditProfile(props: DialogProps & { profile: Profile }) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props ?? {};
  const [_open, _setOpen] = useState(false);
  const open = controlledOpen ?? _open;
  const setOpen = controlledOnOpenChange ?? _setOpen;
  const mutation = useUpdateProfileMutation();
  const isPending = mutation.isPending;

  const form = useForm<TUpdateProfile>({
    resolver: zodResolver(ZUpdateProfile),
    defaultValues: {
      id: props.profile.id,
      first_name: props.profile.firstName,
      last_name: props.profile.lastName,
      about: props.profile.about,
      avatar: props.profile.avatarUrl ?? undefined,
      cover: props.profile.coverImageUrl ?? undefined
    }
  });

  function getDialogProps(): DialogProps {
    return {
      ...props,
      open,
      onOpenChange: chain(props?.onOpenChange, (open: boolean) => {
        if (isPending) return;
        setOpen(open);
      })
    };
  }

  function getRootFormProps(props?: TFormProps<TUpdateProfile>) {
    return { ...props, ...form };
  }

  function getFormFieldProps(field: keyof TUpdateProfile, props?: FormFieldProps) {
    return { ...props, name: field };
  }

  function getFieldControllerProps(field: keyof TUpdateProfile, props?: TFieldControllerProps<TUpdateProfile>) {
    return { ...props, name: field };
  }

  function register(field: keyof TUpdateProfile) {
    return form.register(field);
  }

  function updateUrl(field: "avatar" | "cover", url: string) {
    form.setValue(field, url);
  }

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data, { onSuccess: () => setOpen(false) });
  });

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: chain(props?.onClick, onSubmit),
      loading: isPending || props?.loading
    };
  }

  return {
    getDialogProps,
    getRootFormProps,
    getFormFieldProps,
    getFieldControllerProps,
    register,
    getButtonProps,
    updateUrl
  };
}
