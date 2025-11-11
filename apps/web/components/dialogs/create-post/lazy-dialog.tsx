"use client";

import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { Dash } from "@votewise/ui/icons/dash";

import { useActiveGroup } from "@/lib/global-store";

import { CurrentUserAvatar } from "../../current-user-avatar";
import { AssetPicker, Assets, ContentInput, ProgressTracker, SubmitButton, TitleInput } from "./form-elements";
import { PickTopics } from "./pick-topics";

export function LazyCreatePostDialog(props: React.ComponentProps<typeof Dialog>) {
  const group = useActiveGroup();
  return (
    <Dialog {...props}>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="sr-only">Create a New Post</DialogTitle>
        <DialogDescription className="sr-only">Share your thoughts and ideas with the community!</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />
        {group && (
          <span className="text-sm text-black-300">
            Posting in <b>{group.name}</b>
          </span>
        )}
        <div className="flex flex-col gap-5">
          <div className="flex gap-3 min-h-[calc((200/16)*1rem)]">
            <CurrentUserAvatar />
            <div className="flex flex-col gap-5 flex-1">
              <TitleInput />
              <ContentInput />
              <Assets />
            </div>
          </div>
          <PickTopics />
          <div className="flex items-center justify-between">
            <AssetPicker />
            <ProgressTracker />
          </div>
          <Dash className="text-nobelBlack-200" />
        </div>
        <SubmitButton />
      </DialogContent>
    </Dialog>
  );
}
