"use client";

import { useState } from "react";
import { useMediaQuery } from "react-responsive";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { AvatarBackCards, AvatarCard, AvatarClearButton } from "@votewise/ui/avatar-card";
import { Cross } from "@votewise/ui/icons/cross";

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
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  if (!selectedAvatar) return <Placeholder />;

  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Avatar className="size-28">
          <AvatarImage src={selectedAvatar} alt="Selected Avatar" sizes="112px" />
          <AvatarFallback name="U" />
        </Avatar>
        <button onClick={reset}>
          <Cross className="size-5 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <AvatarCard url={selectedAvatar}>
      <AvatarBackCards />
      <AvatarClearButton onClick={reset} />
    </AvatarCard>
  );
}
