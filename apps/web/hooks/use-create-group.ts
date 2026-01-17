"use client";

import type { TGroupCreate } from "@votewise/schemas/group";
import type { ButtonProps } from "@votewise/ui/button";
import type { DialogProps } from "@votewise/ui/dialog";
import type { FormFieldProps, TFieldControllerProps, TFormProps } from "@votewise/ui/form";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { ZGroupCreate } from "@votewise/schemas/group";
import { useForm } from "@votewise/ui/form";

import { chain } from "@/lib/chain";

import { useCreateGroupMutation } from "./use-create-group-mutation";

export function useCreateGroup(props?: DialogProps) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props ?? {};
  const [_open, _setOpen] = useState(false);
  const open = controlledOpen ?? _open;
  const setOpen = controlledOnOpenChange ?? _setOpen;

  const form = useForm<TGroupCreate>({ resolver: zodResolver(ZGroupCreate) });
  const mutation = useCreateGroupMutation();
  const isPending = mutation.isPending;

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

  function getRootFormProps(props?: TFormProps<TGroupCreate>) {
    return { ...props, ...form };
  }

  function getFormFieldProps(field: keyof TGroupCreate, props?: FormFieldProps) {
    return { ...props, name: field };
  }

  function getFieldControllerProps(field: keyof TGroupCreate, props?: TFieldControllerProps<TGroupCreate>) {
    return { ...props, name: field };
  }

  function register(field: keyof TGroupCreate) {
    return form.register(field);
  }

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data, { onSuccess: () => setOpen(false) });
  });

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: chain(props?.onClick, onSubmit),
      disabled: props?.disabled || isPending,
      loading: isPending
    };
  }

  function onUploadDone(url: string, type: "LOGO" | "COVER") {
    if (type === "LOGO") {
      form.setValue("logo_url", url);
    } else {
      form.setValue("cover_image_url", url);
    }
  }

  return {
    getFormFieldProps,
    getRootFormProps,
    getFieldControllerProps,
    getButtonProps,
    register,
    getDialogProps,
    onUploadDone
  };
}
