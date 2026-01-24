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
import { useCreateFeedMutation } from "@/hooks/use-create-feed-mutation";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useMediaQuery } from "react-responsive";

import { useComboBoxTrigger } from "@votewise/ui/combobox";

import { chain } from "@/lib/chain";
import { onboardClient, uploadClient } from "@/lib/client";
import { cn } from "@/lib/cn";
import { kindOfError } from "@/lib/error";
import { useActiveGroup } from "@/lib/global-store";

/* ----------------------------------------------------------------------------------------------- */

type DialogProps = React.ComponentProps<typeof Dialog>;
type InputProps = React.ComponentProps<typeof Input>;
type TextareaProps = React.ComponentProps<typeof Textarea>;
type LabelProps = React.ComponentProps<"label">;
type ZigZagListProps = React.ComponentProps<typeof ZigZagList>;

const maxLength = 300;
const topicsPromise = onboardClient.getTopics();
const totalAllowedFiles = 5;

/* -----------------------------------------------------------------------------------------------
 * Atoms
 * -----------------------------------------------------------------------------------------------*/
const postContentAtom = atom("");
const titleAtom = atom("");
const filesAtom = atom<{ file: File; preview: string; id: string; hasError?: string }[]>([]);
const isTopicModalOpenAtom = atom(false);
const topicsAtom = atom<Topics>([]);
const selectedTopicsAtom = atom<string[]>([]);
const isCreatePostDialogOpenAtom = atom(false);

/* -----------------------------------------------------------------------------------------------
 * Hooks
 * -----------------------------------------------------------------------------------------------*/
export function useCreatePostDialog() {
  const [isOpen, setIsOpen] = useAtom(isCreatePostDialogOpenAtom);

  function getDialogProps(props?: DialogProps): DialogProps {
    return { ...props, open: isOpen, onOpenChange: chain(setIsOpen, props?.onOpenChange) };
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      ...props,
      onClick: chain(props?.onClick, () => {
        setIsOpen(true);
      })
    };
  }

  return { getDialogProps, getButtonProps };
}

export function useTitleInput() {
  const [title, setPostTitleToAtom] = useAtom(titleAtom);

  function getInputProps(props?: InputProps): InputProps {
    return {
      placeholder: "Headline of your post",
      ...props,
      value: title,
      name: "title",
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
      name: "content",
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
        const slice = Array.from(selectedFiles).slice(0, totalAllowedFiles);
        const fileArray = slice.map((file, index) => ({
          file,
          preview: URL.createObjectURL(file),
          id: `${file.name}-${index}-${Date.now()}`,
          hasError: file.size > 1 * 1024 * 1024 ? "File size exceeds 1MB" : undefined
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
  const isFilesEmpty = files.length === 0;
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const maxFilesToShow = isMobile ? 4 : totalAllowedFiles;
  const remainingFiles = files.length - maxFilesToShow;
  const hasError = files.some((file) => file.hasError);

  function removeFile(fileId: string | number) {
    const newFiles = files.filter((f) => f.id !== fileId);
    setFilesToAtom(newFiles);
  }

  function getZigZagListProps(props?: Partial<ZigZagListProps>): ZigZagListProps {
    return {
      ...props,
      images: files
        .slice(0, maxFilesToShow)
        .map((file) => ({ url: file.preview, id: file.id, hasError: file.hasError }))
    };
  }

  return { getZigZagListProps, removeFile, remainingFiles, isFilesEmpty, hasError };
}

export function useSubmit() {
  const [uploadStatus, setUploadStatus] = useState<AsyncState>("idle");
  const [postContent, setPostContent] = useAtom(postContentAtom);
  const [title, setTitle] = useAtom(titleAtom);
  const [topics, setTopics] = useAtom(selectedTopicsAtom);
  const [files, setFiles] = useAtom(filesAtom);
  const setCreatePostDialogOpen = useSetAtom(isCreatePostDialogOpenAtom);
  const group = useActiveGroup();

  const reset = () => {
    setPostContent("");
    setTitle("");
    setTopics([]);
    setFiles([]);
    setCreatePostDialogOpen(false);
  };

  const mutation = useCreateFeedMutation({ onMutate: reset });

  const isDisabled = !(title && postContent && topics.length > 0);
  const status = mutation.status;

  async function handleSubmit() {
    if (isDisabled) return;

    setUploadStatus("loading");
    const urls: string[] = [];
    if (files.length > 0) {
      const filesWithoutError = files.filter((file) => !file.hasError);
      const promises = filesWithoutError.map((file) => uploadClient.upload(file.file));
      const res = await Promise.all(promises);
      res.map((r) => {
        if (r.success) {
          urls.push(r.data.url);
        }
      });
      setUploadStatus("success");
    }

    mutation.mutate(
      {
        title,
        topics,
        content: postContent,
        status: "OPEN",
        type: "PUBLIC",
        assets: urls.map((url) => ({ url, type: "image" })),
        group_id: group?.id
      },
      {
        onError: (err) => {
          const { isSandbox } = kindOfError(err);
          if (isSandbox) reset();
        }
      }
    );
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return {
      children: "Post",
      ...props,
      disabled: isDisabled,
      onClick: chain(handleSubmit, props?.onClick),
      loading: status === "pending" || uploadStatus === "loading"
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
