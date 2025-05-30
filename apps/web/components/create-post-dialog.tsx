"use client";

import { useState } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@votewise/ui/dialog";
import { FloatingCounter } from "@votewise/ui/floating-counter";
import { Image as ImageIcon } from "@votewise/ui/icons/image";
import { Pencile } from "@votewise/ui/icons/pencile";
import { ClearButton, ZigZagList } from "@votewise/ui/image-card";
import { Input } from "@votewise/ui/input-basic";
import { Progress, ProgressBar, ProgressTrack } from "@votewise/ui/progress";
import { Textarea } from "@votewise/ui/textarea-autosize";

import { useMe } from "./user-provider";

const maxLength = 300;
const postContentAtom = atom("");
const filesAtom = atom<{ file: File; preview: string; id: string }[]>([]);

export function CreatePostDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-fit gap-1">
          <Pencile className="text-gray-200" />
          <span>Share Idea</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="sr-only">Create a New Post</DialogTitle>
        <DialogDescription className="sr-only">Share your thoughts and ideas with the community!</DialogDescription>
        <Close className="absolute top-4 right-5" />
        <div className="flex flex-col gap-5">
          <div className="flex gap-3 min-h-[calc((200/16)*1rem)]">
            <UserProfile />
            <div className="flex flex-col gap-5 flex-1">
              <TitleInput />
              <ContentInput />
              <Assets />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <AssetPicker />
              <ProgressTracker />
            </div>
          </div>
        </div>
        <Button>Post</Button>
      </DialogContent>
    </Dialog>
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
  return (
    <Input
      className="placeholder:text-black-300 placeholder:text-base text-base text-gray-300"
      placeholder="Headline of your post"
    />
  );
}

function ContentInput() {
  const [value, setValue] = useState("");
  const setPostContentToAtom = useSetAtom(postContentAtom);
  return (
    <Textarea
      className="placeholder:text-black-300 placeholder:text-base text-base text-gray-300 w-full"
      placeholder="Share your thoughts here..."
      value={value}
      maxRows={25}
      cacheMeasurements
      onChange={(e) => {
        if (e.target.value.length > 300) {
          e.target.value = e.target.value.slice(0, 300);
        }
        setValue(e.target.value);
        setPostContentToAtom(e.target.value);
      }}
    />
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

const maxFilesToShow = 8;

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
