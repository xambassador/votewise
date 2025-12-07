"use client";

import type { DropzoneOptions } from "react-dropzone";

import { useState } from "react";
import { useDropzone } from "react-dropzone";

import { Image as ImageIcon } from "@votewise/ui/icons/image";

import { cn } from "@/lib/cn";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  onFileDrop?: (files: File[]) => void;
  onSizeError?: (file: File) => void;
  onErrorReset?: () => void;
  disabled?: boolean;
  variant?: "success" | "error";
  dropzoneProps?: DropzoneOptions;
};

export function ImageDropZone(props: Props) {
  const { onFileDrop, children, disabled = false, variant, dropzoneProps, onSizeError, onErrorReset, ...rest } = props;
  const [error, setError] = useState<string | null>(null);
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    ...dropzoneProps,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      ...dropzoneProps?.accept
    },
    onDrop(acceptedFiles, fileRejections, event) {
      let hasError = false;
      setError(null);
      onErrorReset?.();
      fileRejections.forEach((file) => {
        file.errors.forEach((error) => {
          if (error.code === "file-too-large") {
            hasError = true;
            if (dropzoneProps?.maxSize) {
              setError(`File is too large. Max size is ${dropzoneProps?.maxSize / 1024 / 1024}MB`);
            }
            onSizeError?.(file.file);
          }
        });
      });
      if (hasError) return;
      onFileDrop?.(acceptedFiles as File[]);
      dropzoneProps?.onDrop?.(acceptedFiles, fileRejections, event);
    }
  });

  const rootProps = disabled ? {} : getRootProps();
  const inputProps = disabled ? {} : getInputProps();

  return (
    <div
      {...rest}
      {...rootProps}
      className={cn(
        "bg-nobelBlack-200 cursor-pointer sm:h-[calc((250/16)*1rem)] h-[calc((200/16)*1rem)] rounded-3xl border-2 border-dashed border-black-400 grid place-items-center p-5",
        "focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none focus:shadow-input-ring focus:ring-offset-1 focus:ring-offset-nobelBlack-200 transition-shadow",
        isDragActive && "border-blue-200",
        isDragAccept && "border-green-400",
        (isDragReject || error) && "border-red-600 focus:border-red-500 focus:ring-red-500/20",
        disabled && "cursor-not-allowed",
        variant === "success" && "border-green-300",
        variant === "error" && "border-red-600",
        rest.className
      )}
    >
      <input {...inputProps} className="sr-only" accept="image/*" />
      {children}
    </div>
  );
}

export function Placeholder() {
  return (
    <div className="flex flex-col items-center">
      <ImageIcon className="text-black-300 sm:size-12 size-8" />
      <div className="flex flex-col gap-2 items-center mt-5">
        <h2 className="sm:text-lg text-base text-gray-300">Drop your image here</h2>
        <p className="sm:text-sm text-xs font-medium text-gray-400">We support JPG, JPEG and PNG</p>
      </div>
    </div>
  );
}
