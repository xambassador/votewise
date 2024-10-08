"use client";

import { cn } from "@/lib/cn";
import { useDropzone } from "react-dropzone";

import { Image as ImageIcon } from "@votewise/ui/icons/image";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  onFileDrop?: (files: File[]) => void;
  disabled?: boolean;
};

export function ImageDropZone(props: Props) {
  const { onFileDrop, children, disabled = false, ...rest } = props;
  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"]
    },
    onDrop(acceptedFiles) {
      onFileDrop?.(acceptedFiles as File[]);
    }
  });

  const rootProps = disabled ? {} : getRootProps();
  const inputProps = disabled ? {} : getInputProps();

  return (
    <div
      {...rest}
      {...rootProps}
      className={cn(
        "bg-nobelBlack-200 cursor-pointer h-[calc((250/16)*1rem)] rounded-3xl border-2 border-dashed border-black-400 grid place-items-center",
        isDragActive && "border-blue-200",
        isDragAccept && "border-green-400",
        isDragReject && "border-red-600",
        "focus:border-blue-500 focus:ring-blue-500/20 focus:outline-none focus:shadow-input-ring focus:ring-offset-1 focus:ring-offset-nobelBlack-200 transition-shadow",
        disabled && "cursor-not-allowed",
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
      <ImageIcon className="text-black-300 size-12" />
      <div className="flex flex-col gap-2 items-center mt-5">
        <h2 className="text-lg text-gray-300">Drop your image here</h2>
        <p className="text-sm font-medium text-gray-400">We support JPG, JPEG and PNG</p>
      </div>
    </div>
  );
}
