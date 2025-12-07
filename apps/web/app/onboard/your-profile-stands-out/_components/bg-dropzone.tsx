"use client";

import { useState } from "react";

import { Cross } from "@votewise/ui/icons/cross";

import { ImageDropZone, Placeholder } from "@/components/image-dropzone";

import { useGetSelectedBg, useOnFileDropAction, useResetSelection } from "../_utils/store";

export function BackgroundDropzone() {
  const selectedBg = useGetSelectedBg();
  const onFileDropAction = useOnFileDropAction();
  const [error, setError] = useState<string | null>(null);
  return (
    <ImageDropZone
      variant={selectedBg ? "success" : undefined}
      onFileDrop={onFileDropAction}
      disabled={!!selectedBg}
      dropzoneProps={{ maxSize: 5 * 1024 * 1024 }}
      onSizeError={() => setError("File size should be less than 5MB")}
      onErrorReset={() => setError(null)}
    >
      <BackgroundDropzonePlaceholder />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </ImageDropZone>
  );
}

function BackgroundDropzonePlaceholder() {
  const selectedBg = useGetSelectedBg();

  if (!selectedBg) return <Placeholder />;

  return (
    <div className="relative size-full sm:min-h-[calc((180/16)*1rem)] sm:max-h-[calc((180/16)*1rem)] min-h-[calc((160/16)*1rem)] max-h-[calc((160/16)*1rem)]">
      <figure className="size-full relative overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={selectedBg} alt="Background" className="size-full object-cover absolute inset-0" />
      </figure>
      <ResetButton />
    </div>
  );
}

function ResetButton() {
  const reset = useResetSelection();
  return (
    <button
      onClick={reset}
      className="absolute -top-2 -right-2 rounded-full border border-black-400 bg-nobelBlack-200 p-1 hover:scale-110 hover:rotate-90 transition-transform duration-200"
    >
      <Cross className="sm:size-6 size-4" />
    </button>
  );
}
