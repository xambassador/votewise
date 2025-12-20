"use client";

import type { TChangePassword } from "@votewise/schemas/auth";
import type { ButtonProps } from "@votewise/ui/button";
import type { DialogProps } from "@votewise/ui/dialog";
import type { FormFieldProps, TFieldControllerProps, TFormProps } from "@votewise/ui/form";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { ZChangePassword } from "@votewise/schemas/auth";
import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";
import { isPasswordStrong } from "@/lib/password";

import { changePasswordAction } from "../action";

export function useChangePassword(props?: DialogProps) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange } = props ?? {};
  const [_open, _setOpen] = useState(false);
  const open = controlledOpen ?? _open;
  const setOpen = controlledOnOpenChange ?? _setOpen;

  const form = useForm<TChangePassword>({
    resolver: zodResolver(ZChangePassword),
    defaultValues: {
      new_password: "",
      old_password: ""
    }
  });
  const mutation = useMutation({
    mutationFn: async (data: TChangePassword) => {
      const res = await changePasswordAction(data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      makeToast.success("Success!", "Your password has been changed.");
      setOpen(false);
    },
    onError: (error) => {
      makeToast.error("Oops!", error.message);
    }
  });
  const isPending = mutation.isPending;
  const password = form.watch("new_password");

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

  function getRootFormProps(props?: TFormProps<TChangePassword>) {
    return { ...props, ...form };
  }

  function getFormFieldProps(field: keyof TChangePassword, props?: FormFieldProps) {
    return { ...props, name: field };
  }

  function getFieldControllerProps(field: keyof TChangePassword, props?: TFieldControllerProps<TChangePassword>) {
    return { ...props, name: field };
  }

  function register(field: keyof TChangePassword) {
    return form.register(field);
  }

  const onSubmit = form.handleSubmit((data) => {
    const isStrong = isPasswordStrong(data.new_password);
    if (!isStrong) {
      form.setError("new_password", { message: "Password is too weak" });
      return;
    }
    mutation.mutate(data);
  });

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: chain(props?.onClick, onSubmit),
      disabled: props?.disabled || isPending,
      loading: isPending
    };
  }

  return {
    getFormFieldProps,
    getRootFormProps,
    getFieldControllerProps,
    getButtonProps,
    register,
    getDialogProps,
    password
  };
}
