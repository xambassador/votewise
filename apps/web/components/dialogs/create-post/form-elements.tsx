"use client";

import { memo } from "react";

import { Button } from "@votewise/ui/button";
import { FloatingCounter } from "@votewise/ui/floating-counter";
import { Image as ImageIcon } from "@votewise/ui/icons/image";
import { ClearButton, ZigZagList } from "@votewise/ui/image-card";
import { Input } from "@votewise/ui/input-basic";
import { Progress, ProgressBar, ProgressTrack } from "@votewise/ui/progress";
import { Textarea } from "@votewise/ui/textarea-autosize";

import { useAssetPicker, useAssets, useContentInput, useProgressTracker, useSubmit, useTitleInput } from "./store";

export function TitleInput() {
  const { getInputProps } = useTitleInput();
  return <Input {...getInputProps({ className: titleInputClassname })} />;
}

export function ContentInput() {
  const { getTextareaProps } = useContentInput();
  return <Textarea {...getTextareaProps({ className: contentInputClassname })} />;
}

export function Assets() {
  const { isFilesEmpty, remainingFiles, getZigZagListProps, removeFile } = useAssets();
  if (isFilesEmpty) return null;
  return (
    <ZigZagList
      {...getZigZagListProps({
        className: "relative w-fit",
        imageCardProps: (props) => ({
          children: <ClearButton variant="topLeft" size="lg" onClick={() => removeFile(props.image.id)} />,
          figureProps: { className: props.image.hasError ? "border-2 border-red-500" : "" }
        })
      })}
    >
      {remainingFiles > 0 && (
        <FloatingCounter variant="rightCenter" className={floatingCounterClassname}>
          +{remainingFiles}
        </FloatingCounter>
      )}
    </ZigZagList>
  );
}

export function AssetsError() {
  const { hasError } = useAssets();
  if (!hasError) return null;
  return (
    <div className="w-full bg-nobelBlack-200 rounded p-2">
      <p className="text-xs text-red-500">One or more selected files has an error and could not be uploaded.</p>
    </div>
  );
}

export const AssetPicker = memo(function AssetPicker() {
  const { getInputProps, getLabelProps } = useAssetPicker();
  return (
    <label {...getLabelProps({ className: assetPickerClassName })}>
      <ImageIcon />
      <span>Photo / Video</span>
      <input {...getInputProps({ className: "sr-only" })} />
    </label>
  );
});

export function ProgressTracker() {
  const { progressPercentage, remainingChars } = useProgressTracker();
  return (
    <div className="flex items-center gap-2">
      <span className="text-black-300 text-sm font-medium">{remainingChars}</span>
      <Progress progress={progressPercentage}>
        <ProgressTrack />
        <ProgressBar />
      </Progress>
    </div>
  );
}

export function SubmitButton() {
  const { getButtonProps } = useSubmit();
  return <Button {...getButtonProps()} />;
}

const titleInputClassname = "placeholder:text-black-300 placeholder:text-base text-base text-gray-300";
const contentInputClassname = "placeholder:text-black-300 placeholder:text-base text-base text-gray-300 w-full";
const floatingCounterClassname =
  "-right-5 peer-hover:opacity-0 peer-hover:delay-0 transition-opacity peer-hover:duration-100 duration-300 delay-300";
const assetPickerClassName = "flex items-center gap-2 text-black-300 cursor-pointer focus-visible focus-preset rounded";
