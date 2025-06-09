"use client";

import type { Topics } from "@/types";
import type { AsyncState } from "@votewise/types";

import { useEffect, useState } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import {
  ComboBoxEmpty,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxList,
  ComboBoxPlaceholder,
  ComboBoxPortal,
  ComboBoxRoot,
  ComboBoxSelection,
  useComboBoxTrigger
} from "@votewise/ui/combobox";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@votewise/ui/dialog";
import { FloatingCounter } from "@votewise/ui/floating-counter";
import { Image as ImageIcon } from "@votewise/ui/icons/image";
import { Pencile } from "@votewise/ui/icons/pencile";
import { ClearButton, ZigZagList } from "@votewise/ui/image-card";
import { Input } from "@votewise/ui/input-basic";
import { Progress, ProgressBar, ProgressTrack } from "@votewise/ui/progress";
import { Spinner } from "@votewise/ui/ring-spinner";
import { Textarea } from "@votewise/ui/textarea-autosize";
import { makeToast } from "@votewise/ui/toast";

import { feedClient, onboardClinet, uploadClient } from "@/lib/client";

import { useMe } from "./user-provider";

const maxFilesToShow = 8;
const maxLength = 300;
const postContentAtom = atom("");
const titleAtom = atom("");
const filesAtom = atom<{ file: File; preview: string; id: string }[]>([]);
const isTopicModalOpenAtom = atom(false);
const topicsAtom = atom<Topics>([]);
const selectedTopicsAtom = atom<string[]>([]);
const topicsPromise = onboardClinet.getTopics();
const isCreatePostDialogOpenAtom = atom(false);

export function CreatePostDialog() {
  const [isOpen, setIsOpen] = useAtom(isCreatePostDialogOpenAtom);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-fit gap-1">
          <Pencile className="text-gray-200" />
          <span>Share Idea</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="sr-only">Create a New Post</DialogTitle>
        <DialogDescription className="sr-only">Share your thoughts and ideas with the community!</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2" />
        <div className="flex flex-col gap-5">
          <FormArea />
          <ComboBox />
          <Footer />
        </div>
        <SubmitButton />
      </DialogContent>
    </Dialog>
  );
}

function FormArea() {
  return (
    <div className="flex gap-3 min-h-[calc((200/16)*1rem)]">
      <UserProfile />
      <div className="flex flex-col gap-5 flex-1">
        <TitleInput />
        <ContentInput />
        <Assets />
      </div>
    </div>
  );
}

function UserProfile() {
  const { avatar_url, first_name, last_name } = useMe("UserProfile");
  return (
    <Avatar className="size-12">
      <AvatarFallback name={first_name + " " + last_name} />
      <AvatarImage src={avatar_url} alt={first_name + " " + last_name} className="object-cover" />
    </Avatar>
  );
}

function TitleInput() {
  const [title, setPostTitleToAtom] = useAtom(titleAtom);
  return (
    <Input
      className="placeholder:text-black-300 placeholder:text-base text-base text-gray-300"
      placeholder="Headline of your post"
      value={title}
      onChange={(e) => {
        if (e.target.value.length > 100) {
          e.target.value = e.target.value.slice(0, 100);
        }
        setPostTitleToAtom(e.target.value);
      }}
    />
  );
}

function ContentInput() {
  const [postContent, setPostContentToAtom] = useAtom(postContentAtom);
  return (
    <Textarea
      className="placeholder:text-black-300 placeholder:text-base text-base text-gray-300 w-full"
      placeholder="Share your thoughts here..."
      value={postContent}
      maxRows={25}
      cacheMeasurements
      onChange={(e) => {
        if (e.target.value.length > 300) {
          e.target.value = e.target.value.slice(0, 300);
        }
        setPostContentToAtom(e.target.value);
      }}
    />
  );
}

function Footer() {
  return (
    <div className="flex items-center justify-between">
      <AssetPicker />
      <ProgressTracker />
    </div>
  );
}

function ProgressTracker() {
  const postContent = useAtomValue(postContentAtom);
  const currentLength = postContent.length;
  const progressPercentage = (currentLength / maxLength) * 100;
  const remainingChars = maxLength - currentLength;
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

function AssetPicker() {
  const setFilesToAtom = useSetAtom(filesAtom);
  const files = useAtomValue(filesAtom);

  return (
    <label
      className="flex items-center gap-2 text-black-300 cursor-pointer"
      htmlFor="asset-picker"
      aria-label="Add Photos or Videos"
      aria-describedby="asset-picker"
    >
      <ImageIcon />
      <span>Photo / Video</span>
      <input
        type="file"
        accept="image/*,video/*"
        className="sr-only"
        multiple
        id="asset-picker"
        onChange={(e) => {
          const selectedFiles = e.target.files;
          if (!selectedFiles || !selectedFiles.length) return;
          const fileArray = Array.from(selectedFiles).map((file, index) => ({
            file,
            preview: URL.createObjectURL(file),
            id: `${file.name}-${index}-${Date.now()}`
          }));
          setFilesToAtom([...files, ...fileArray]);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function Assets() {
  const files = useAtomValue(filesAtom);
  const setFilesToAtom = useSetAtom(filesAtom);
  if (files.length === 0) return null;
  const remainingFiles = files.length - maxFilesToShow;
  return (
    <ZigZagList
      className="relative w-fit"
      images={files.slice(0, maxFilesToShow).map((file) => ({ url: file.preview, id: file.id }))}
      imageCardProps={(props) => ({
        children: (
          <ClearButton
            variant="topLeft"
            size="lg"
            onClick={() => {
              const newFiles = files.filter((f) => f.id !== props.image.id);
              setFilesToAtom(newFiles);
            }}
          />
        )
      })}
    >
      {remainingFiles > 0 && (
        <FloatingCounter
          variant="rightCenter"
          className="-right-5 peer-hover:opacity-0 peer-hover:delay-0 transition-opacity peer-hover:duration-100 duration-300 delay-300"
        >
          {remainingFiles}
        </FloatingCounter>
      )}
    </ZigZagList>
  );
}

function SubmitButton() {
  const [status, setStatus] = useState<AsyncState>("idle");
  const [postContent, setPostContent] = useAtom(postContentAtom);
  const [title, setTitle] = useAtom(titleAtom);
  const [topics, setTopics] = useAtom(selectedTopicsAtom);
  const setCreatePostDialogOpen = useSetAtom(isCreatePostDialogOpenAtom);
  const isDisabled = !(title && postContent && topics.length > 0);
  const [files, setFiles] = useAtom(filesAtom);

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

  return (
    <Button disabled={isDisabled} onClick={handleSubmit} loading={status === "loading"}>
      Post
    </Button>
  );
}

function ComboBox() {
  const [selectedTopics, setSelectedTopics] = useAtom(selectedTopicsAtom);
  return (
    <ComboBoxRoot selected={selectedTopics} onChange={setSelectedTopics}>
      <PickTopicsModalTrigger />
      <PickTopicsModal />
    </ComboBoxRoot>
  );
}

function PickTopicsModal() {
  const [status, setStats] = useState<AsyncState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useAtom(isTopicModalOpenAtom);
  const [topics, setTopics] = useAtom(topicsAtom);
  const selectedTopics = useAtomValue(selectedTopicsAtom);

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

  const nonSelectedTopics = topics.filter((topic) => !selectedTopics.includes(topic.id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="sr-only">Pick Topics</DialogTitle>
        <DialogDescription className="sr-only">Select topics relevant to your post</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1 pl-4 flex-wrap w-full">
            <ComboBoxSelection
              getLabel={(v) => {
                const topic = topics.find((t) => t.id === v);
                return topic ? topic.name : v;
              }}
            />
          </div>
          <ComboBoxPortal>
            <ComboBoxInput placeholder="Search topics..." autoFocus />
            <ComboBoxList className="scroller">
              {status === "loading" && (
                <div className="flex items-center justify-center min-h-[300px]">
                  <Spinner className="size-5" />
                </div>
              )}
              {status === "error" && (
                <ComboBoxEmpty className="text-red-500">{error || "Failed to load topics"}</ComboBoxEmpty>
              )}
              {status === "success" && topics.length > 0 ? (
                <>
                  {nonSelectedTopics.map((topic) => (
                    <ComboBoxItem
                      key={topic.id}
                      value={topic.id}
                      className="cursor-pointer"
                      disabled={selectedTopics.length >= 5}
                    >
                      {topic.name}
                    </ComboBoxItem>
                  ))}
                  <ComboBoxEmpty>No topics found</ComboBoxEmpty>
                </>
              ) : null}
              {status === "success" && topics.length === 0 && <ComboBoxEmpty>No topics available</ComboBoxEmpty>}
            </ComboBoxList>
          </ComboBoxPortal>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickTopicsModalTrigger() {
  const { getTriggerProps } = useComboBoxTrigger();
  const setPickTopicModal = useSetAtom(isTopicModalOpenAtom);
  const topics = useAtomValue(topicsAtom);
  return (
    <div
      {...getTriggerProps({
        className: "flex items-center gap-1 w-fit flex-wrap outline-none focus:ring-2 cursor-pointer",
        onClick: () => setPickTopicModal(true)
      })}
    >
      <ComboBoxSelection
        getLabel={(v) => {
          const topic = topics.find((t) => t.id === v);
          return topic ? topic.name : v;
        }}
      />
      <ComboBoxPlaceholder className="text-black-300">Select topic(s)</ComboBoxPlaceholder>
    </div>
  );
}
