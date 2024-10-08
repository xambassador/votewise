"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { cn } from "./cn";
import { createContext } from "./context";
import { Cross } from "./icons/cross";
import { Image as ImgIcon } from "./icons/image";

/* ----------------------------------------------------------------------------------------------- */

const url = "/votewise-bucket/votewise/assets/avatars/avatar_1.png";
const theme = {
  imagePicker: "relative size-[calc((200/16)*1rem)] overflow-hidden",
  img: "size-full object-cover",
  imagePreview: "rounded-full relative size-full overflow-hidden border-2 border-red-200"
};

const [Provider, useProvider] = createContext<{
  preview: string;
  isDefault: boolean;
  onPreviewChange: (preview: string | null) => void;
}>("ImagePicker");

/* -----------------------------------------------------------------------------------------------
 * ImagePicker
 * -----------------------------------------------------------------------------------------------*/
type ImagePickerProps = React.HTMLAttributes<HTMLDivElement> & { url?: string | null };

export function ImagePicker(props: ImagePickerProps) {
  const { url: controlledUrl, ...rest } = props;
  const [preview, setPreview] = useState<string>(controlledUrl || url);
  const isDefault = !controlledUrl;

  const onPreviewChange = useCallback((preview: string | null) => {
    if (!preview) {
      setPreview(url);
      return;
    }
    setPreview(preview);
  }, []);

  useEffect(() => {
    setPreview(controlledUrl || url);
  }, [controlledUrl]);

  return (
    <Provider preview={preview} onPreviewChange={onPreviewChange} isDefault={isDefault}>
      <div {...rest} className={cn(theme.imagePicker, rest?.className)} />
    </Provider>
  );
}

/* -----------------------------------------------------------------------------------------------
 * ImagePreview
 * -----------------------------------------------------------------------------------------------*/
type ImagePreviewProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  imageWrapperProps?: React.HTMLAttributes<HTMLElement>;
  caption?: string;
};

export function ImagePreview(props: ImagePreviewProps) {
  const { preview } = useProvider("ImagePreview");
  const { imageWrapperProps, caption = "User avatar", children, ...rest } = props;

  return (
    <figure {...imageWrapperProps} className={cn(theme.imagePreview, imageWrapperProps?.className)}>
      <Img {...rest} src={preview} alt={rest.alt || "User avatar"} />
      <figcaption className="sr-only">{caption}</figcaption>
      {children}
    </figure>
  );
}

/* -----------------------------------------------------------------------------------------------
 * ImagePickerButton
 * -----------------------------------------------------------------------------------------------*/
type ImagePickerButtonProps = React.HTMLAttributes<HTMLLabelElement> & {
  isMultiple?: boolean;
  accept?: string;
  preventDefaultBehavior?: boolean;
};

export function ImagePickerButton(props: ImagePickerButtonProps) {
  const { isMultiple = false, accept = "image/*", preventDefaultBehavior = false, ...rest } = props;
  const { onPreviewChange } = useProvider("ImagePickerButton");
  const id = useId();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length) {
      onPreviewChange(URL.createObjectURL(files[0]));
    }
    e.target.value = "";
  }

  return (
    <>
      <input type="file" id={id} className="sr-only" multiple={isMultiple} accept={accept} onChange={handleChange} />
      <label
        {...rest}
        htmlFor={preventDefaultBehavior ? "__optout__" + id : id}
        className={cn(
          "absolute bottom-3 cursor-pointer right-0 size-11 flex items-center justify-center rounded-full overflow-hidden bg-nobelBlack-100 border border-nobelBlack-200",
          rest?.className
        )}
      >
        {rest?.children || <ImgIcon className="text-black-200" />}
      </label>
    </>
  );
}

/* -----------------------------------------------------------------------------------------------
 * ResetPreviewButton
 * -----------------------------------------------------------------------------------------------*/
type ResetPreviewButtonProps = React.HTMLAttributes<HTMLDivElement> & { onReset?: () => void };

export function ResetPreviewButton(props: ResetPreviewButtonProps) {
  const { onReset, ...rest } = props;
  const { preview, onPreviewChange, isDefault } = useProvider("ResetPreviewButton");

  function onResetClick() {
    onPreviewChange(null);
    onReset?.();
  }

  if (!preview) return null;
  if (isDefault) return null;

  return (
    <div
      {...rest}
      className={cn(
        "absolute opacity-0 hover:opacity-100 transition-opacity duration-300 inset-0 bg-black-900/40 flex items-center justify-center",
        "rounded-full overflow-hidden",
        rest.className
      )}
    >
      <button
        type="button"
        onClick={onResetClick}
        className="p-2 flex items-center justify-center rounded-full overflow-hidden bg-nobelBlack-100 border border-nobelBlack-200"
      >
        <Cross className="size-4" />
      </button>
    </div>
  );
}

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={props.src} alt={props.alt} className={cn(theme.img, props.className)} />;
}
