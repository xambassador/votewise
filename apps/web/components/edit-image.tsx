"use client";

import type { Crop, PixelCrop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import type { ButtonProps } from "@votewise/ui/button";

import { useRef, useState } from "react";
import { ReactCrop } from "react-image-crop";

import { Button } from "@votewise/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@votewise/ui/dialog";

import { chain } from "@/lib/chain";

export type EditImageProps = React.ComponentProps<typeof Dialog> & {
  src: File | null;
  onSave?: (file: File) => void;
  cropperProps?: Partial<React.ComponentProps<typeof ReactCrop>>;
  onCancel?: () => void;
  saveButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
};

function getCroppedImage(image: HTMLImageElement, crop: Crop, originalFile?: File): Promise<File> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("No 2D context");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  canvas.width = cropWidth as number;
  canvas.height = cropHeight as number;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const name = originalFile?.name || "cropped.jpg";
      const file = new File([blob], name, { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg");
  });
}

export function EditImage(props: EditImageProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="w-fit min-w-[calc((768/16)*1rem)]">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Image</DialogTitle>
          <DialogDescription className="sr-only">Crop and adjust your image</DialogDescription>
        </DialogHeader>
        <ImageCropper {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ImageCropper(props: EditImageProps) {
  const { src: controlledSrc, cropperProps, onSave: _onSave, onCancel, saveButtonProps, cancelButtonProps } = props;
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: cropperProps?.minWidth ?? 200,
    height: cropperProps?.minHeight ?? 200
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const src = controlledSrc ? URL.createObjectURL(controlledSrc) : null;

  async function onSave() {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return;
    }
    const blob = await getCroppedImage(image, completedCrop, controlledSrc || undefined);
    _onSave?.(blob);
  }

  if (!src) {
    return null;
  }

  return (
    <div className="p-5 overflow-hidden">
      <ReactCrop
        className="max-h-[600px] w-full bg-nobelBlack-200"
        crop={crop}
        onChange={(_, percentCrop) => setCrop(percentCrop)}
        onComplete={(c) => setCompletedCrop(c)}
        {...cropperProps}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Crop me" src={src || undefined} className="max-h-96 max-w-full" ref={imgRef} />
      </ReactCrop>

      <div className="flex items-center justify-end gap-2 mt-5">
        <Button {...saveButtonProps} onClick={chain(onSave, saveButtonProps?.onClick)}>
          {saveButtonProps?.children || "Save"}
        </Button>
        <Button variant="secondary" {...cancelButtonProps} onClick={chain(onCancel, cancelButtonProps?.onClick)}>
          {cancelButtonProps?.children || "Cancel"}
        </Button>
      </div>
    </div>
  );
}
