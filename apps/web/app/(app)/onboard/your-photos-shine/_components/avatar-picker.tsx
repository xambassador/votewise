"use client";

import { ImagePicker, ImagePickerButton, ImagePreview, ResetPreviewButton } from "@votewise/ui/image-picker";

import { useAvatarPicker } from "../_hooks/use-avatar-picker";

export function AvatarPicker(props?: { url?: string }) {
  const { url } = props || {};
  const { getImagePickerButtonProps, getImagePickerProps, getResetPreviewButtonProps } = useAvatarPicker({ url });
  return (
    <ImagePicker {...getImagePickerProps({ className: "mx-auto" })}>
      <ImagePreview />
      <ResetPreviewButton {...getResetPreviewButtonProps()} />
      <ImagePickerButton {...getImagePickerButtonProps()} />
    </ImagePicker>
  );
}
