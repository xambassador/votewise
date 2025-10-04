"use client";

import type { EditImageProps } from "@/components/edit-image";
import type { TGroupCreate } from "@votewise/schemas/group";
import type { AsyncState } from "@votewise/types";
import type { ButtonProps } from "@votewise/ui/button";
import type { DialogProps } from "@votewise/ui/dialog";
import type { FormFieldProps, TFieldControllerProps, TFormProps } from "@votewise/ui/form";
import type { ImagePickerPillProps } from "@votewise/ui/image-picker";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import { ZGroupCreate } from "@votewise/schemas/group";
import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";
import { uploadClient } from "@/lib/client";

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
    mutation.mutate(data, {
      onSuccess: () => setOpen(false),
      onError: (error) => {
        makeToast.error("Oops!", error.message);
      }
    });
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

type UploadAssetsProps = {
  onUploadDone?: (url: string) => void;
  size?: number; // in MB
};

export function useUploadAsset(props?: UploadAssetsProps) {
  const { onUploadDone, size = 1 } = props ?? {};
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [status, setStatus] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);

  function getImagePickerProps(props?: ImagePickerPillProps): ImagePickerPillProps {
    return {
      ...props,
      files: file ? [file] : [],
      children: error ? error : (props?.children ?? "Upload image"),
      hasError: status === "error" || !!error,
      isLoading: status === "loading",
      inputProps: {
        accept: "image/*",
        disabled: status === "loading",
        onChange: chain(props?.inputProps?.onChange, (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;

          if (file.size > size * 1024 * 1024) {
            setError(`File size should be less than ${size}MB`);
            return;
          }

          setError(null);
          setCropperFile(file);
          setOpenCropper(true);
        })
      }
    };
  }

  function getEditorProps(props?: Omit<EditImageProps, "src">): EditImageProps {
    return {
      ...props,
      src: cropperFile,
      open: openCropper,
      onOpenChange: setOpenCropper,
      onSave: onFileCrop,
      onCancel: onFileCropCancel,
      saveButtonProps: { loading: status === "loading" }
    };
  }

  async function onFileCrop(file: File) {
    setOpenCropper(false);
    setStatus("loading");
    const res = await uploadClient.upload(file);
    if (!res.success) {
      makeToast.error("Upload failed", res.error);
      setStatus("error");
      return;
    }

    setFile(file);
    setCropperFile(null);
    onUploadDone?.(res.data.url);
    setStatus("success");
  }

  function onFileCropCancel() {
    setOpenCropper(false);
    setCropperFile(null);
  }

  return { getImagePickerProps, openCropper, getEditorProps, setOpenCropper, onFileCrop, onFileCropCancel };
}
