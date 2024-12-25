import type { ImagePickerButtonProps, ImagePickerProps, ResetPreviewButtonProps } from "@votewise/ui/image-picker";

import { useEffect, useState } from "react";

import { useGetSavedAvatar, useResetSelection, useSetDialogOpen, useSetSavedAvatar } from "../_utils/store";

export function useAvatarPicker(props?: { url?: string }) {
  const { url } = props || {};
  const savedAvatar = useGetSavedAvatar();
  const setDialogOpen = useSetDialogOpen();
  const reset = useResetSelection();
  const setDefaultAvatar = useSetSavedAvatar();

  const [showFallback, setShowFallback] = useState(url ? true : false);

  useEffect(() => {
    if (!url) return;
    setDefaultAvatar(url);
    setShowFallback(false);
  }, [setDefaultAvatar, url]);

  function getImagePickerButtonProps(props?: ImagePickerButtonProps): ImagePickerButtonProps {
    return { ...props, preventDefaultBehavior: true, onClick: () => setDialogOpen(true) };
  }

  function getImagePickerProps(props?: ImagePickerProps): ImagePickerProps {
    if (savedAvatar instanceof File) {
      const url = URL.createObjectURL(savedAvatar);
      return { ...props, url, spinner: showFallback };
    }
    return { ...props, url: savedAvatar, spinner: showFallback };
  }

  function getResetPreviewButtonProps(props?: ResetPreviewButtonProps): ResetPreviewButtonProps {
    return { ...props, onReset: reset };
  }

  return { getImagePickerButtonProps, savedAvatar, getImagePickerProps, getResetPreviewButtonProps };
}
