"use client";

import type { TDisableMFA } from "@votewise/schemas/auth";
import type { ButtonProps } from "@votewise/ui/button";
import type { DialogProps } from "@votewise/ui/dialog";
import type { FormFieldProps, TFormProps } from "@votewise/ui/form";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ZDisableMFA } from "@votewise/schemas/auth";
import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { disableMFAAction } from "@/app/action";

import { chain } from "@/lib/chain";
import { getMyAccountKey } from "@/lib/constants";

export function useDisableMFA(props: DialogProps & { factorId: string }) {
  const { open: controlledOpen, onOpenChange: controlledOnOpenChange, factorId } = props ?? {};
  const [_open, _setOpen] = useState(false);
  const open = controlledOpen ?? _open;
  const setOpen = controlledOnOpenChange ?? _setOpen;
  const qc = useQueryClient();

  const form = useForm<TDisableMFA>({
    resolver: zodResolver(ZDisableMFA),
    defaultValues: {
      password: "",
      challenge_id: "__THIS_WILL_BE_FILLED_LATER__",
      otp: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: TDisableMFA) => {
      const res = await disableMFAAction(factorId, data);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onSuccess: () => {
      makeToast.success("Success!", "Multi-factor authentication has been disabled.");
      setOpen(false);
    },
    onError: (error) => {
      makeToast.error("Oops!", error.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: getMyAccountKey() });
    }
  });

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

  function getRootFormProps(props?: TFormProps<TDisableMFA>) {
    return { ...props, ...form };
  }

  function getFormFieldProps(field: keyof TDisableMFA, props?: FormFieldProps) {
    return { ...props, name: field };
  }

  function register(field: keyof TDisableMFA) {
    return form.register(field);
  }

  const onSubmit = form.handleSubmit((data) => {
    if (!data.otp || data.otp.length !== 6) {
      form.setError("otp", { message: "Please enter a valid 6-digit code." });
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
    getButtonProps,
    register,
    getDialogProps,
    updateOtp: (otp: string) => {
      form.setValue("otp", otp);
    }
  };
}
