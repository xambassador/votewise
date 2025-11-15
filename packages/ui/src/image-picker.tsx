"use client";

import { useCallback, useEffect, useId, useState } from "react";

import { cn } from "./cn";
import { createContext } from "./context";
import { Cross } from "./icons/cross";
import { Image as ImgIcon } from "./icons/image";
import { Spinner } from "./ring-spinner";

/* ----------------------------------------------------------------------------------------------- */

export const defaultAvatarUrl = "/votewise-bucket/votewise/assets/avatars/default_avatar.png";
export const defaultBgUrl = "/votewise-bucket/votewise/assets/backgrounds/default_bg.jpeg";

const theme = {
  imagePicker: "relative size-[calc((200/16)*1rem)] overflow-hidden",
  img: "size-full object-cover",
  imagePreview: "rounded-full relative size-full overflow-hidden border-2 border-red-200"
};

const [Provider, useProvider] = createContext<{
  preview: string | null;
  spinner?: boolean;
  onPreviewChange: (preview: string | null) => void;
}>("ImagePicker");

/* -----------------------------------------------------------------------------------------------
 * ImagePicker
 * -----------------------------------------------------------------------------------------------*/
export type ImagePickerProps = React.HTMLAttributes<HTMLDivElement> & { url?: string | null; spinner?: boolean };

export function ImagePicker(props: ImagePickerProps) {
  const { url: controlledUrl, spinner, ...rest } = props;
  const [preview, setPreview] = useState<string | null>(null);

  const onPreviewChange = useCallback((preview: string | null) => {
    setPreview(preview);
  }, []);

  useEffect(() => {
    setPreview(controlledUrl as string | null);
  }, [controlledUrl]);

  return (
    <Provider preview={preview} onPreviewChange={onPreviewChange} spinner={spinner}>
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
  defaultUrl?: string;
};

export function ImagePreview(props: ImagePreviewProps) {
  const { preview, spinner } = useProvider("ImagePreview");
  const { imageWrapperProps, caption = "User avatar", children, defaultUrl = defaultAvatarUrl, ...rest } = props;

  return (
    <figure {...imageWrapperProps} className={cn(theme.imagePreview, imageWrapperProps?.className)}>
      {spinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-black-900">
          <Spinner className="size-8 text-white-50" />
        </div>
      )}
      <Img {...rest} src={preview || defaultUrl} alt={rest.alt || "User avatar"} />
      <figcaption className="sr-only">{caption}</figcaption>
      {children}
    </figure>
  );
}

/* -----------------------------------------------------------------------------------------------
 * ImagePickerButton
 * -----------------------------------------------------------------------------------------------*/
export type ImagePickerButtonProps = React.HTMLAttributes<HTMLLabelElement> & {
  isMultiple?: boolean;
  accept?: string;
  preventDefaultBehavior?: boolean;
  onFileSelect?: (file: File | null) => void;
  iconProps?: React.SVGAttributes<SVGElement>;
  updatePreview?: boolean;
};

export function ImagePickerButton(props: ImagePickerButtonProps) {
  const {
    isMultiple = false,
    accept = "image/*",
    preventDefaultBehavior = false,
    onFileSelect,
    iconProps,
    updatePreview = true,
    ...rest
  } = props;
  const { onPreviewChange } = useProvider("ImagePickerButton");
  const id = useId();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length) {
      onFileSelect?.(files[0]);
      if (updatePreview) {
        onPreviewChange(URL.createObjectURL(files[0]));
      }
    }
    e.target.value = "";
  }

  return (
    <label
      {...rest}
      htmlFor={preventDefaultBehavior ? "__optout__" + id : id}
      className={cn(
        "absolute bottom-3 cursor-pointer right-0 size-11 flex items-center justify-center rounded-full overflow-hidden bg-nobelBlack-100 border border-nobelBlack-200 focus-within-presets focus-within-primary",
        rest?.className
      )}
    >
      <input type="file" id={id} className="sr-only" multiple={isMultiple} accept={accept} onChange={handleChange} />
      {rest?.children || <ImgIcon {...iconProps} className={cn("text-black-200", iconProps?.className)} />}
    </label>
  );
}

/* -----------------------------------------------------------------------------------------------
 * ResetPreviewButton
 * -----------------------------------------------------------------------------------------------*/
export type ResetPreviewButtonProps = React.HTMLAttributes<HTMLDivElement> & { onReset?: () => void };

export function ResetPreviewButton(props: ResetPreviewButtonProps) {
  const { onReset, ...rest } = props;
  const { preview, onPreviewChange } = useProvider("ResetPreviewButton");

  function onResetClick() {
    onPreviewChange(null);
    onReset?.();
  }

  if (!preview) return null;

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

export type ImagePickerPillProps = React.HTMLAttributes<HTMLLabelElement> & {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  files?: File[] | null;
  hasError?: boolean;
  isLoading?: boolean;
};

export function ImagePickerPill(props: ImagePickerPillProps) {
  const { children, inputProps, files: controlledFiles, hasError, isLoading, ...rest } = props;
  const id = useId();
  const [files, setFiles] = useState<File[]>(controlledFiles ?? []);

  useEffect(() => {
    setFiles(controlledFiles ?? []);
  }, [controlledFiles]);

  const isDisabled = isLoading || inputProps?.disabled;
  const hasFiles = !!files?.length;

  let label = children || <span>Upload Image</span>;
  if (hasFiles && files) {
    if (files.length === 1) {
      label = <span className="text-blue-400">{files[0].name}</span>;
    } else {
      label = <span className="text-blue-400">{files.length} files selected</span>;
    }
  }

  if (hasError) {
    label = <span className="text-red-400">{label}</span>;
  }

  if (isLoading) {
    label = <span className="text-green-400">Uploading...</span>;
  }

  return (
    <label
      {...rest}
      htmlFor={id}
      className={cn(
        "flex items-center gap-3 text-sm text-black-200 cursor-pointer focus-within-presets focus-within-primary",
        rest?.className
      )}
      aria-invalid={hasError || undefined}
    >
      <input
        {...inputProps}
        disabled={isDisabled}
        type="file"
        id={id}
        className="sr-only"
        onChange={(e) => {
          setFiles(e.target.files ? Array.from(e.target.files) : []);
          inputProps?.onChange?.(e);
          e.target.value = "";
        }}
      />
      <div className="cursor-pointer size-11 flex items-center justify-center rounded-full overflow-hidden bg-nobelBlack-100 border border-nobelBlack-200">
        <ImgIcon className={cn("text-black-200", hasFiles && "text-blue-400", hasError && "text-red-400")} />
      </div>
      {label}
    </label>
  );
}
