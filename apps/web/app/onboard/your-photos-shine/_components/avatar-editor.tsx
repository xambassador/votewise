"use client";

import { EditImage } from "@/components/edit-image";

import { useGetEditImageDialogProps } from "../_utils/store";

export function AvatarEditor() {
  const editImageProps = useGetEditImageDialogProps();
  return (
    <EditImage
      {...editImageProps}
      cropperProps={{ aspect: 1, circularCrop: true, maxWidth: 350, minWidth: 120, minHeight: 120 }}
    />
  );
}
