"use client";

import type { ImagePickerButtonProps, ImagePickerProps, ResetPreviewButtonProps } from "@votewise/ui/image-picker";

import { useEffect, useState } from "react";

import { useGetSavedBg, useResetSelection, useSetDialogOpen, useSetSavedBg } from "../_utils/store";

export function useBackgroundPicker(props?: { url?: string }) {
  const { url } = props || {};
  const setOpen = useSetDialogOpen();
  const savedBackground = useGetSavedBg();
  const reset = useResetSelection();
  const setSavedBg = useSetSavedBg();

  const [showFallback, setShowFallback] = useState(url ? true : false);

  useEffect(() => {
    if (!url) return;
    setSavedBg(url);
    setShowFallback(false);
  }, [setSavedBg, url]);

  function getImagePickerProps(props?: ImagePickerProps): ImagePickerProps {
    if (savedBackground instanceof File) {
      return { ...props, url: URL.createObjectURL(savedBackground), spinner: showFallback };
    }
    return { ...props, url: savedBackground, spinner: showFallback };
  }

  function getResetButtonProps(props?: ResetPreviewButtonProps): ResetPreviewButtonProps {
    return { ...props, onReset: reset };
  }

  function getPickerButtonProps(props?: ImagePickerButtonProps): ImagePickerButtonProps {
    return { ...props, onClick: () => setOpen(true), preventDefaultBehavior: true };
  }

  return { getImagePickerProps, getResetButtonProps, getPickerButtonProps };
}
