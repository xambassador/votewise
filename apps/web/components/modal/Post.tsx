import React, { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";

import classNames from "@votewise/lib/classnames";
import { ModalTitle, Spinner, TextArea, Thumbnail, UnstyledSelect } from "@votewise/ui";
import { FiGlobe } from "@votewise/ui/icons";

type PostModalContainerProps = React.HTMLAttributes<HTMLDivElement>;
export function PostModalContainer(props: PostModalContainerProps) {
  const { className, ...rest } = props;
  return (
    <div
      className={classNames(
        "shadow-notification-container flex w-[calc((510/16)*1rem)] flex-col items-start gap-7 rounded-lg bg-white p-8",
        className
      )}
      {...rest}
    />
  );
}

type PostModalTitleProps = React.ComponentProps<typeof ModalTitle>;
export function PostModalTitle(props: PostModalTitleProps) {
  return <ModalTitle {...props} />;
}

type PostModalContentProps = React.HTMLAttributes<HTMLDivElement>;
export function PostModalContent(props: PostModalContentProps) {
  const { className, ...rest } = props;
  return <div className={classNames("flex w-full flex-col gap-8", className)} {...rest} />;
}

type PostModalFormProps = React.HTMLAttributes<HTMLFormElement>;
export function PostModalForm(props: PostModalFormProps) {
  const { className, ...rest } = props;
  return <form className={classNames("flex w-full flex-col gap-8", className)} {...rest} />;
}

type PostModalTextAreaProps = React.ComponentProps<typeof TextArea>;

export const PostModalTextArea = React.forwardRef<HTMLTextAreaElement, PostModalTextAreaProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <TextArea
        ref={ref}
        className={classNames(
          "h-[calc((120/16)*1rem)] resize-none border-none text-gray-600 placeholder:text-base placeholder:text-gray-400 focus:ring-0",
          className
        )}
        {...rest}
      />
    );
  }
);

type PostModalEditorProps = React.HTMLAttributes<HTMLDivElement>;
export function PostModalEditor(props: PostModalEditorProps) {
  const { className, ...rest } = props;
  return (
    <div
      className={classNames("relative overflow-hidden rounded-lg border border-gray-200", className)}
      {...rest}
    />
  );
}

type PostModalFileUploaderProps = {
  inputProps: React.HTMLAttributes<HTMLInputElement>;
  labelProps?: React.HTMLAttributes<HTMLLabelElement>;
};
export function PostModalFileUploaderInput(props: PostModalFileUploaderProps) {
  const { inputProps, labelProps } = props;
  const id = useId();
  return (
    <>
      <input type="file" accept="image/*,video/*" className="hidden" id={id} multiple {...inputProps} />
      <label
        htmlFor={id}
        {...labelProps}
        className={classNames("cursor-pointer text-gray-600", labelProps?.className)}
      >
        Photo / Video
      </label>
    </>
  );
}

type PostModalImagePreviewProps = React.ComponentProps<typeof Thumbnail>;
export function PostModalImagePreview(props: PostModalImagePreviewProps) {
  return <Thumbnail {...props} />;
}

type PostModalLoaderProps = React.ComponentProps<typeof Spinner>;
export function PostModalLoader(props: PostModalLoaderProps) {
  const { className, ...rest } = props;
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-600/80">
      <Spinner className={classNames("h-5 w-5", className)} {...rest} />
    </div>
  );
}

type PostModalFilesContainerProps = React.HTMLAttributes<HTMLDivElement>;
export function PostModalFilesContainer(props: PostModalFilesContainerProps) {
  const { className, ...rest } = props;
  return (
    <div
      className={classNames(
        "mb-4 grid max-h-[calc((150/16)*1rem)] w-full grid-cols-4 gap-2 overflow-y-auto px-4",
        className
      )}
      {...rest}
    />
  );
}

type PostTypeSelectMenuProps = {
  options: { label: string; value: "PUBLIC" | "GROUP_ONLY" }[];
  defaultOption?: { label: string; value: "PUBLIC" | "GROUP_ONLY" };
} & React.HTMLAttributes<HTMLDivElement>;

export function PostTypeSelectMenu(props: PostTypeSelectMenuProps) {
  const { options, defaultOption, ...rest } = props;
  const { control } = useFormContext();
  return (
    <div className="flex items-center" {...rest}>
      <FiGlobe className="h-5 w-5 text-gray-500" />
      <div className="w-28">
        <Controller
          name="type"
          control={control}
          defaultValue={defaultOption}
          render={({ field }) => (
            <UnstyledSelect options={options} className="text-left" defaultValue={options[0]} {...field} />
          )}
        />
      </div>
    </div>
  );
}
