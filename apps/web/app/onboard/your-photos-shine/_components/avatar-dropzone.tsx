"use client";

import { AvatarBackCards, AvatarCard, AvatarClearButton } from "@votewise/ui/avatar-card";

import { ImageDropZone, Placeholder } from "@/components/image-dropzone";

import { useGetSelectedAvatar, useOnFileDropAction, useResetSelection } from "../_utils/store";

/* ----------------------------------------------------------------------------------------------- */

export function AvatarDropZone() {
  const selectedAvatar = useGetSelectedAvatar();
  const onFileDropAction = useOnFileDropAction();
  return (
    <ImageDropZone
      variant={selectedAvatar ? "success" : undefined}
      onFileDrop={onFileDropAction}
      disabled={!!selectedAvatar}
    >
      <ImageDropZonePlaceholder />
    </ImageDropZone>
  );
}

function ImageDropZonePlaceholder() {
  const selectedAvatar = useGetSelectedAvatar();
  const reset = useResetSelection();

  if (!selectedAvatar) return <Placeholder />;

  return (
    <AvatarCard url={selectedAvatar}>
      <AvatarBackCards />
      <AvatarClearButton onClick={reset} />
    </AvatarCard>
  );
}
