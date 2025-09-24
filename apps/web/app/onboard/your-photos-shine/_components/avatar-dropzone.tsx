"use client";

import { useState } from "react";

import { AvatarBackCards, AvatarCard, AvatarClearButton } from "@votewise/ui/avatar-card";

import { ImageDropZone, Placeholder } from "@/components/image-dropzone";

import { useGetSelectedAvatar, useOnFileDropAction, useResetSelection } from "../_utils/store";

/* ----------------------------------------------------------------------------------------------- */

export function AvatarDropZone() {
  const selectedAvatar = useGetSelectedAvatar();
  const onFileDropAction = useOnFileDropAction();
  const [error, setError] = useState<string | null>(null);
  return (
    <ImageDropZone
      variant={selectedAvatar ? "success" : undefined}
      onFileDrop={onFileDropAction}
      disabled={!!selectedAvatar}
      dropzoneProps={{ maxSize: 2 * 1024 * 1024 }}
      onSizeError={() => setError("File size should be less than 2MB")}
      onErrorReset={() => setError(null)}
    >
      <ImageDropZonePlaceholder />
      {error && <p className="text-red-500 text-sm">{error}</p>}
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
