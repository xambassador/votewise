"use client";

import {
  defaultBgUrl,
  ImagePicker,
  ImagePickerButton,
  ImagePreview,
  ResetPreviewButton
} from "@votewise/ui/image-picker";

import { useBackgroundPicker } from "../_hooks/use-background-picker";

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
