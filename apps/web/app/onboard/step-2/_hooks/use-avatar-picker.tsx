import type { ImagePicker, ImagePickerButton, ResetPreviewButton } from "@votewise/ui/image-picker";

import { useGetSavedAvatar, useResetSelection, useSetDialogOpen } from "../_utils/store";

type ImagePickerProps = React.ComponentProps<typeof ImagePicker>;
type ImagePickerButtonProps = React.ComponentProps<typeof ImagePickerButton>;
type ResetPreviewButtonProps = React.ComponentProps<typeof ResetPreviewButton>;

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
