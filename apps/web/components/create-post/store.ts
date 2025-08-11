"use client";

import type { Topics } from "@/types";
import type { AsyncState } from "@votewise/types";
import type { ButtonProps } from "@votewise/ui/button";
import type { ComboBoxRootProps, ComboBoxSelectionProps } from "@votewise/ui/combobox";
import type { Dialog } from "@votewise/ui/dialog";
import type { ZigZagList } from "@votewise/ui/image-card";
import type { Input } from "@votewise/ui/input-basic";
import type { Textarea } from "@votewise/ui/textarea-autosize";

import { useEffect, useId, useRef, useState } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import { useComboBoxTrigger } from "@votewise/ui/combobox";
import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";
import { feedClient, onboardClient, uploadClient } from "@/lib/client";
import { cn } from "@/lib/cn";

/* ----------------------------------------------------------------------------------------------- */

type DialogProps = React.ComponentProps<typeof Dialog>;
type InputProps = React.ComponentProps<typeof Input>;
type TextareaProps = React.ComponentProps<typeof Textarea>;
type LabelProps = React.ComponentProps<"label">;
type ZigZagListProps = React.ComponentProps<typeof ZigZagList>;

const maxLength = 300;
const maxFilesToShow = 8;
const topicsPromise = onboardClient.getTopics();

/* -----------------------------------------------------------------------------------------------
 * Atoms
 * -----------------------------------------------------------------------------------------------*/
const postContentAtom = atom("");
const titleAtom = atom("");
const filesAtom = atom<{ file: File; preview: string; id: string }[]>([]);
const isTopicModalOpenAtom = atom(false);
const topicsAtom = atom<Topics>([]);
const selectedTopicsAtom = atom<string[]>([]);
const isCreatePostDialogOpenAtom = atom(false);

/* -----------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/
export function useCreatePostDialog() {
  const lazyLoaded = useRef(false);
  const [isOpen, setIsOpen] = useAtom(isCreatePostDialogOpenAtom);

  function getDialogProps(props?: DialogProps): DialogProps {
    return { ...props, open: isOpen, onOpenChange: chain(setIsOpen, props?.onOpenChange) };
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: chain(() => {
        lazyLoaded.current = true;
        setIsOpen(true);
      }, props?.onClick)
    };
  }

  function isLazyLoaded() {
    return lazyLoaded.current;
  }

  return { getDialogProps, getButtonProps, isLazyLoaded };
}

export function useTitleInput() {
  const [title, setPostTitleToAtom] = useAtom(titleAtom);

  function getInputProps(props?: InputProps): InputProps {
    return {
      placeholder: "Headline of your post",
      ...props,
      value: title,
      onChange: chain((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 100) {
          e.target.value = e.target.value.slice(0, 100);
        }
        setPostTitleToAtom(e.target.value);
      }, props?.onChange)
    };
  }

  return { getInputProps };
}

export function useContentInput() {
  const [postContent, setPostContentToAtom] = useAtom(postContentAtom);

  function getTextareaProps(props?: TextareaProps): TextareaProps {
    return {
      placeholder: "Share your thoughts here...",
      maxRows: 25,
      cacheMeasurements: true,
      ...props,
      value: postContent,
      onChange: chain((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length > 300) {
          e.target.value = e.target.value.slice(0, 300);
        }
        setPostContentToAtom(e.target.value);
      }, props?.onChange)
    };
  }

  return { getTextareaProps };
}

export function useProgressTracker() {
  const postContent = useAtomValue(postContentAtom);
  const currentLength = postContent.length;
  const progressPercentage = (currentLength / maxLength) * 100;
  const remainingChars = maxLength - currentLength;
  return { progressPercentage, remainingChars };
}

export function useAssetPicker() {
  const setFilesToAtom = useSetAtom(filesAtom);
  const files = useAtomValue(filesAtom);
  const ref = useRef<HTMLInputElement>(null);
  const id = useId();

  function handleLabelKeyDown(event: React.KeyboardEvent<HTMLLabelElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ref.current?.click();
    }
  }

  function getLabelProps(props?: LabelProps): LabelProps {
    return {
      "aria-label": "Add Photos or Videos",
      tabIndex: 0,
      ...props,
      "aria-describedby": id,
      htmlFor: id,
      onKeyDown: handleLabelKeyDown
    };
  }

  function getInputProps(props?: InputProps): InputProps {
    return {
      ...props,
      ref,
      type: "file",
      accept: "image/*,video/*",
      className: "sr-only",
      multiple: true,
      id,
      onChange: chain((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || !selectedFiles.length) return;
        const fileArray = Array.from(selectedFiles).map((file, index) => ({
          file,
          preview: URL.createObjectURL(file),
          id: `${file.name}-${index}-${Date.now()}`
        }));
        setFilesToAtom([...files, ...fileArray]);
        e.target.value = "";
      }, props?.onChange)
    };
  }

  return { getLabelProps, getInputProps };
}

export function useAssets() {
  const files = useAtomValue(filesAtom);
  const setFilesToAtom = useSetAtom(filesAtom);
  const remainingFiles = files.length - maxFilesToShow;
  const isFilesEmpty = files.length === 0;

  function removeFile(fileId: string | number) {
    const newFiles = files.filter((f) => f.id !== fileId);
    setFilesToAtom(newFiles);
  }

  function getZigZagListProps(props?: Partial<ZigZagListProps>): ZigZagListProps {
    return { ...props, images: files.slice(0, maxFilesToShow).map((file) => ({ url: file.preview, id: file.id })) };
  }

  return { getZigZagListProps, removeFile, remainingFiles, isFilesEmpty };
}

export function useSubmit() {
  const [status, setStatus] = useState<AsyncState>("idle");
  const [postContent, setPostContent] = useAtom(postContentAtom);
  const [title, setTitle] = useAtom(titleAtom);
  const [topics, setTopics] = useAtom(selectedTopicsAtom);
  const setCreatePostDialogOpen = useSetAtom(isCreatePostDialogOpenAtom);
  const [files, setFiles] = useAtom(filesAtom);
  const isDisabled = !(title && postContent && topics.length > 0);

  async function handleSubmit() {
    if (isDisabled) return;

    setStatus("loading");
    const urls: string[] = [];

    if (files.length > 0) {
      const promises = files.map((file) => uploadClient.upload(file.file));
      const res = await Promise.all(promises);
      res.map((r) => {
        if (r.success) {
          urls.push(r.data.url);
        }
      });
    }

    const res = await feedClient.create({
      title,
      topics,
      content: postContent,
      status: "OPEN",
      type: "PUBLIC",
      assets: urls.map((url) => ({ url, type: "image" }))
    });
    if (!res.success) {
      makeToast.error("Oops! Failed to create post.", res.error);
      setStatus("error");
      return;
    }

    setStatus("success");
    setPostContent("");
    setTitle("");
    setTopics([]);
    setFiles([]);
    setCreatePostDialogOpen(false);
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      children: "Post",
      ...props,
      disabled: isDisabled,
      onClick: chain(handleSubmit, props?.onClick),
      loading: status === "loading"
    };
  }

  return { getButtonProps };
}

export function usePickTopicsComboBox() {
  const [selectedTopics, setSelectedTopics] = useAtom(selectedTopicsAtom);

  function getComboBoxRootProps(props?: ComboBoxRootProps): ComboBoxRootProps {
    return { ...props, selected: selectedTopics, onChange: chain(setSelectedTopics, props?.onChange) };
  }

  return { getComboBoxRootProps };
}

export function usePickTopics() {
  const [status, setStats] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useAtom(isTopicModalOpenAtom);
  const [topics, setTopics] = useAtom(topicsAtom);
  const selectedTopics = useAtomValue(selectedTopicsAtom);
  const nonSelectedTopics = topics.filter((topic) => !selectedTopics.includes(topic.id));
  const disabled = selectedTopics.length >= 5;

  useEffect(() => {
    if (!isOpen) return;
    setStats("loading");
    topicsPromise.then((res) => {
      if (!res.success) {
        setError(res.error);
        return;
      }
      setTopics(res.data.topics);
      setStats("success");
    });
  }, [isOpen, setTopics]);

  function getDialogProps(props?: DialogProps): DialogProps {
    return { ...props, open: isOpen, onOpenChange: chain(setIsOpen, props?.onOpenChange) };
  }

  function getComboBoxSelectionProps(props?: ComboBoxSelectionProps): ComboBoxSelectionProps {
    return {
      ...props,
      getLabel: (v) => {
        const topic = topics.find((t) => t.id === v);
        return topic ? topic.name : v;
      }
    };
  }

  return { getDialogProps, getComboBoxSelectionProps, disabled, status, error, topics: nonSelectedTopics };
}

export function usePickTopicsTrigger() {
  const { getTriggerProps: _getTriggerProps } = useComboBoxTrigger();
  const setPickTopicModal = useSetAtom(isTopicModalOpenAtom);
  const topics = useAtomValue(topicsAtom);

  type Params = Parameters<typeof _getTriggerProps>[0];

  function getComboBoxSelectionProps(props?: ComboBoxSelectionProps): ComboBoxSelectionProps {
    return {
      ...props,
      getLabel: (v) => {
        const topic = topics.find((t) => t.id === v);
        return topic ? topic.name : v;
      }
    };
  }

  function getTriggerProps(props?: Params): Params {
    return _getTriggerProps({
      ...props,
      className: cn(
        "flex items-center gap-1 w-fit flex-wrap outline-none focus:ring-2 cursor-pointer focus-primary rounded-full",
        props?.className
      ),
      onClick: chain(() => setPickTopicModal(true), props?.onClick),
      role: "button",
      tabIndex: 0
    });
  }

  return { getTriggerProps, getComboBoxSelectionProps };
}
