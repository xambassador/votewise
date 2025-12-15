"use client";

import {
  ComboBoxEmpty,
  ComboBoxInput,
  ComboBoxItem,
  ComboBoxList,
  ComboBoxPlaceholder,
  ComboBoxPortal,
  ComboBoxRoot,
  ComboBoxSelection
} from "@votewise/ui/combobox";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { Spinner } from "@votewise/ui/ring-spinner";

import { usePickTopics, usePickTopicsComboBox, usePickTopicsTrigger } from "./store";

export function PickTopics() {
  const { getComboBoxRootProps } = usePickTopicsComboBox();
  return (
    <ComboBoxRoot {...getComboBoxRootProps()}>
      <PickTopicsModalTrigger />
      <PickTopicsModal />
    </ComboBoxRoot>
  );
}

function PickTopicsModal() {
  const { error, topics, status, getComboBoxSelectionProps, getDialogProps, disabled } = usePickTopics();
  let content: React.ReactNode = null;

  switch (status) {
    case "loading": {
      content = (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner className="size-5" />
        </div>
      );
      break;
    }

    case "error": {
      content = <ComboBoxEmpty className="text-red-500">{error || "Failed to load topics"}</ComboBoxEmpty>;
      break;
    }

    case "success": {
      if (topics.length > 0) {
        content = (
          <>
            {topics.map((topic) => (
              <ComboBoxItem key={topic.id} value={topic.id} className="cursor-pointer" disabled={disabled}>
                {topic.name}
              </ComboBoxItem>
            ))}
            <ComboBoxEmpty>No topics found</ComboBoxEmpty>
          </>
        );
      } else {
        content = <ComboBoxEmpty>No topics available</ComboBoxEmpty>;
      }
      break;
    }
  }

  return (
    <Dialog {...getDialogProps()}>
      <DialogContent className="sm:p-12 px-5 py-8 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="sr-only">Pick Topics</DialogTitle>
        <DialogDescription className="sr-only">Select topics relevant to your post</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1 pl-4 flex-wrap w-full">
            <ComboBoxSelection {...getComboBoxSelectionProps()} />
          </div>
          <ComboBoxPortal>
            <ComboBoxInput placeholder="Search topics..." autoFocus />
            <ComboBoxList className="scroller">{content}</ComboBoxList>
          </ComboBoxPortal>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickTopicsModalTrigger() {
  const { getComboBoxSelectionProps, getTriggerProps } = usePickTopicsTrigger();
  return (
    <div {...getTriggerProps()}>
      <ComboBoxSelection {...getComboBoxSelectionProps()} />
      <ComboBoxPlaceholder className="text-black-300">Select topic(s)</ComboBoxPlaceholder>
    </div>
  );
}
