import type { ImagePickerButtonProps, ImagePickerProps, ResetPreviewButtonProps } from "@votewise/ui/image-picker";

import { useGetSavedAvatar, useResetSelection, useSetDialogOpen } from "../_utils/store";

export function useAvatarPicker() {
  const savedAvatar = useGetSavedAvatar();
  const setDialogOpen = useSetDialogOpen();
  const reset = useResetSelection();

  function getImagePickerButtonProps(props?: ImagePickerButtonProps): ImagePickerButtonProps {
    return { ...props, preventDefaultBehavior: true, onClick: () => setDialogOpen(true) };
  }

  function getImagePickerProps(props?: ImagePickerProps): ImagePickerProps {
    return { ...props, url: savedAvatar };
  }

  function getResetPreviewButtonProps(props?: ResetPreviewButtonProps): ResetPreviewButtonProps {
    return { ...props, onReset: reset };
  }

  return { getImagePickerButtonProps, savedAvatar, getImagePickerProps, getResetPreviewButtonProps };
}
