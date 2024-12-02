"use client";

import type { ImagePickerButtonProps, ImagePickerProps, ResetPreviewButtonProps } from "@votewise/ui/image-picker";

import { useGetSavedBg, useResetSelection, useSetDialogOpen } from "../_utils/store";

export function useBackgroundPicker() {
  const setOpen = useSetDialogOpen();
  const savedBackground = useGetSavedBg();
  const reset = useResetSelection();

  function getImagePickerProps(props?: ImagePickerProps): ImagePickerProps {
    return { ...props, url: savedBackground };
  }

  function getResetButtonProps(props?: ResetPreviewButtonProps): ResetPreviewButtonProps {
    return { ...props, onReset: reset };
  }

  function getPickerButtonProps(props?: ImagePickerButtonProps): ImagePickerButtonProps {
    return { ...props, onClick: () => setOpen(true), preventDefaultBehavior: true };
  }

  return { getImagePickerProps, getResetButtonProps, getPickerButtonProps };
}
