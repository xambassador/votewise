"use client";

import type { Crop, PixelCrop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import { useRef, useState } from "react";
import { ReactCrop } from "react-image-crop";

import { Button } from "@votewise/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@votewise/ui/dialog";

export type EditImageProps = React.ComponentProps<typeof Dialog> & {
  src: File | null;
  onSave?: (file: File) => void;
  cropperProps?: Partial<React.ComponentProps<typeof ReactCrop>>;
  onCancel?: () => void;
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
  const { src: controlledSrc, cropperProps, onSave: _onSave, onCancel, ...rest } = props;
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: cropperProps?.minWidth ?? 200,
    height: cropperProps?.minHeight ?? 200
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const src = controlledSrc ? URL.createObjectURL(controlledSrc) : "";

  async function onSave() {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return;
    }
    const blob = await getCroppedImage(image, completedCrop, controlledSrc || undefined);
    _onSave?.(blob);
    rest?.onOpenChange?.(false);
  }

  return (
    <Dialog {...rest}>
      <DialogContent className="w-fit">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Image</DialogTitle>
          <DialogDescription className="sr-only">Crop and adjust your image</DialogDescription>
        </DialogHeader>
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
            <Button onClick={onSave}>Save</Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
