"use client";

import { BackgroundList } from "@votewise/ui/background-list";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";

import { useGetChooseBgDialogProps, useSelectBgFromList } from "../_utils/store";

export function ChooseBackgroundDialog() {
  const props = useGetChooseBgDialogProps();
  const onSelect = useSelectBgFromList();
  return (
    <Dialog {...props}>
      <DialogContent className="p-12">
        <DialogTitle className="sr-only">Select a Background</DialogTitle>
        <DialogDescription className="sr-only">Select a background to make your profile stand out!</DialogDescription>
        <BackgroundList onSelect={onSelect} />
        <Close />
      </DialogContent>
    </Dialog>
  );
}
