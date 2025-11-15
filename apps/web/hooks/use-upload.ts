"use client";

import type { EditImageProps } from "@/components/edit-image";
import type { AsyncState } from "@votewise/types";
import type { ImagePickerButtonProps, ImagePickerPillProps, ImagePickerProps } from "@votewise/ui/image-picker";

import { useState } from "react";

import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";
import { uploadClient } from "@/lib/client";

type UploadAssetsProps = {
  onUploadDone?: (url: string) => void;
  onError?: (type: "validation" | "api", error: string) => void;
  size?: number; // in MB
};

export function useUploadAsset(props?: UploadAssetsProps) {
  const { onUploadDone, size = 1, onError } = props ?? {};
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [openCropper, setOpenCropper] = useState(false);
  const [status, setStatus] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(file: File | null) {
    if (!file) return;

    if (file.size > size * 1024 * 1024) {
      const msg = `File size should be less than ${size}MB`;
      setError(msg);
      onError?.("validation", msg);
      return;
    }

    setError(null);
    setCropperFile(file);
    setOpenCropper(true);
  }

  function getImagePickerPillProps(props?: ImagePickerPillProps): ImagePickerPillProps {
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
          handleFileSelect(file);
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
      onError?.("api", res.error);
      return;
    }

    setFile(file);
    setCropperFile(null);
    onUploadDone?.(res.data.url);
    setStatus("success");
  }

  function getImagePickerProps(props?: ImagePickerProps): ImagePickerProps {
    return { ...props, url: file ? URL.createObjectURL(file) : undefined };
  }

  function onFileCropCancel() {
    setOpenCropper(false);
    setCropperFile(null);
  }

  function getImagePickerButtonProps(props?: ImagePickerButtonProps): ImagePickerButtonProps {
    return {
      ...props,
      onFileSelect: handleFileSelect
    };
  }

  return {
    getImagePickerPillProps,
    openCropper,
    getEditorProps,
    setOpenCropper,
    onFileCrop,
    onFileCropCancel,
    getImagePickerButtonProps,
    getImagePickerProps
  };
}
