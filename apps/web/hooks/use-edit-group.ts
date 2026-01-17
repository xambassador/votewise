"use client";

import type { TGroupUpdate } from "@votewise/schemas/group";
import type { ButtonProps } from "@votewise/ui/button";
import type { DialogProps } from "@votewise/ui/dialog";
import type { FormFieldProps, TFieldControllerProps, TFormProps } from "@votewise/ui/form";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { ZGroupUpdate } from "@votewise/schemas/group";
import { useForm } from "@votewise/ui/form";

import { chain } from "@/lib/chain";

import { useUpdateGroupMutation } from "./use-update-group-mutation";

export function useEditGroup(props: DialogProps & { group: TGroupUpdate & { id: string } }) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props ?? {};
  const [_open, _setOpen] = useState(false);
  const open = controlledOpen ?? _open;
  const setOpen = controlledOnOpenChange ?? _setOpen;

  const form = useForm<TGroupUpdate>({
    resolver: zodResolver(ZGroupUpdate),
    defaultValues: {
      name: props.group.name,
      description: props.group.description,
      type: props.group.type,
      status: props.group.status,
      logo_url: props.group.logo_url,
      cover_image_url: props.group.cover_image_url
    }
  });
  const mutation = useUpdateGroupMutation();
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

  function getRootFormProps(props?: TFormProps<TGroupUpdate>) {
    return { ...props, ...form };
  }

  function getFormFieldProps(field: keyof TGroupUpdate, props?: FormFieldProps) {
    return { ...props, name: field };
  }

  function getFieldControllerProps(field: keyof TGroupUpdate, props?: TFieldControllerProps<TGroupUpdate>) {
    return { ...props, name: field };
  }

  function register(field: keyof TGroupUpdate) {
    return form.register(field);
  }

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate({ ...data, id: props.group.id }, { onSuccess: () => setOpen(false) });
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
