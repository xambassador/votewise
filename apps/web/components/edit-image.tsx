"use client";

import type { Crop, PixelCrop } from "react-image-crop";

import "react-image-crop/dist/ReactCrop.css";

import { useEffect, useRef, useState } from "react";
import { ReactCrop } from "react-image-crop";

import { Button } from "@votewise/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@votewise/ui/dialog";

type Props = React.ComponentProps<typeof Dialog> & {
  src: string | File | null;
  onSave?: (file: File) => void;
  cropperProps?: Partial<React.ComponentProps<typeof ReactCrop>>;
};

export function EditImage(props: Props) {
  const { src: controlledSrc, cropperProps, onSave: _onSave, ...rest } = props;
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const src = controlledSrc && typeof controlledSrc === "object" ? URL.createObjectURL(controlledSrc) : controlledSrc;

  async function onSave() {
    const image = imgRef.current;
    if (!image || !completedCrop) {
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
    const ctx = offscreen.getContext("2d");
    if (!ctx) {
      throw new Error("No 2d context");
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    const blob = await offscreen.convertToBlob({
      type: "image/png"
    });

    const fileName = controlledSrc && typeof controlledSrc === "object" ? controlledSrc.name : "cropped.png";
    const file = new File([blob], fileName, { type: "image/png" });
    _onSave?.(file);
    rest?.onOpenChange?.(false);
  }

  useEffect(() => {
    setCrop({ unit: "px", width: cropperProps?.minWidth || 50, height: cropperProps?.minHeight || 50, x: 25, y: 25 });
  }, [controlledSrc, cropperProps?.minHeight, cropperProps?.minWidth]);

  return (
    <Dialog {...rest}>
      <DialogContent className="max-w-3xl">
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
            <img alt="Crop me" src={src || undefined} className="min-h-32" ref={imgRef} />
          </ReactCrop>

          <div className="flex items-center justify-end gap-2 mt-5">
            <Button onClick={onSave}>Save</Button>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
