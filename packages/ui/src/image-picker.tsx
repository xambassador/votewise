"use client";

import { useId, useState } from "react";

import { cn } from "./cn";
import { createContext } from "./context";
import { Cross } from "./icons/cross";
import { Image as ImgIcon } from "./icons/image";

const [Provider, useProvider] = createContext<{
  preview: string | null;
  onPreviewChange: (preview: string | null) => void;
}>("ImagePicker");

const url = "/votewise-bucket/votewise/assets/avatars/avatar_1.png";

export function ImagePicker(
  props: Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & { children: React.ReactNode }
) {
  const [preview, setPreview] = useState<string | null>(null);

  function onPreviewChange(preview: string | null) {
    setPreview(preview);
  }

  return (
    <Provider preview={preview} onPreviewChange={onPreviewChange}>
      <div {...props} className={cn("relative size-[calc((200/16)*1rem)] overflow-hidden", props?.className)} />
    </Provider>
  );
}

function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={props.src} alt={props.alt} className={cn("size-full object-cover", props.className)} />;
}

type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "children"> & {
  imageWrapperProps?: React.HTMLAttributes<HTMLElement>;
  caption?: string;
  children?: React.ReactNode;
};

export function ImagePreview(props: ImageProps) {
  const { preview } = useProvider("ImagePreview");
  const { imageWrapperProps, caption, children, ...rest } = props;
  const imgUrl = preview || rest.src || url;

  return (
    <figure
      {...imageWrapperProps}
      className={cn(
        "rounded-full relative size-full overflow-hidden border-2 border-red-200",
        imageWrapperProps?.className
      )}
    >
      <Img {...rest} src={imgUrl} alt={rest.alt} className={rest.className} />
      <figcaption className="sr-only">{caption}</figcaption>
      {children}
    </figure>
  );
}

export function ImagePickerButton(
  props: React.HTMLAttributes<HTMLLabelElement> & {
    isMultiple?: boolean;
    accept?: string;
    preventDefaultBehavior?: boolean;
  }
) {
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

export function ResetPreviewButton() {
  const { preview, onPreviewChange } = useProvider("ResetPreviewButton");

  if (!preview) return null;

  return (
    <div className="absolute opacity-0 hover:opacity-100 transition-opacity duration-300 inset-0 bg-black-900/40 flex items-center justify-center">
      <button
        type="button"
        onClick={() => {
          onPreviewChange(null);
        }}
        className="p-2 flex items-center justify-center rounded-full overflow-hidden bg-nobelBlack-100 border border-nobelBlack-200"
      >
        <Cross className="size-4" />
      </button>
    </div>
  );
}
