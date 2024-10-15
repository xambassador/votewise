"use client";

import {
  defaultBgUrl,
  ImagePicker,
  ImagePickerButton,
  ImagePreview,
  ResetPreviewButton
} from "@votewise/ui/image-picker";

import { useGetSavedBg, useResetSelection, useSetDialogOpen } from "../_utils/store";

export function BackgrondPicker() {
  const { getResetButtonProps, getPickerButtonProps, getImagePickerProps } = useBackgroundPicker();
  return (
    <ImagePicker {...getImagePickerProps({ className: "w-full max-h-[calc((200/16)*1rem)]" })}>
      <ImagePreview defaultUrl={defaultBgUrl} imageWrapperProps={{ className: "rounded-lg" }} />
      <ResetPreviewButton {...getResetButtonProps({ className: "rounded-lg" })} />
      <ImagePickerButton {...getPickerButtonProps({ className: "right-4" })} />
    </ImagePicker>
  );
}

/* -----------------------------------------------------------------------------------------------
 * useBackgroundPicker
 * -----------------------------------------------------------------------------------------------*/
type ImagePickerProps = React.ComponentProps<typeof ImagePicker>;
type ResetPreviewButtonProps = React.ComponentProps<typeof ResetPreviewButton>;
type ImagePickerButtonProps = React.ComponentProps<typeof ImagePickerButton>;

function useBackgroundPicker() {
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
