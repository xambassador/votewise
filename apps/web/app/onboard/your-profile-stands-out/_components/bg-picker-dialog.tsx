"use client";

import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { SeparatorWithLabel } from "@votewise/ui/separator";

import { useGetDialogProps, useGetSelectedBg, useSaveAction, useSetChooseBgDialogOpen } from "../_utils/store";
import { BackgroundDropzone } from "./bg-dropzone";
import { ChooseBackgroundDialog } from "./choose-bg-dialog";

/* ----------------------------------------------------------------------------------------------- */

export function BackgroundPickerDialog() {
  const props = useGetDialogProps();
  return (
    <Dialog {...props}>
      <DialogContent className="p-12">
        <DialogTitle className="sr-only">Choose a Background</DialogTitle>
        <DialogDescription className="sr-only">
          Showcase your best background and make your profile stand out!
        </DialogDescription>
        <div className="flex flex-col gap-10">
          <BackgroundDropzone />
          <SeparatorWithLabel>Or</SeparatorWithLabel>
          <div className="flex flex-col gap-2">
            <ChooseBgButton />
            <SaveButton />
          </div>
        </div>
        <Close />
      </DialogContent>
    </Dialog>
  );
}

function ChooseBgButton() {
  const setOpen = useSetChooseBgDialogOpen();
  return (
    <>
      <ChooseBackgroundDialog />
      <Button onClick={() => setOpen(true)} variant="secondary">
        Choose from our stunning backgrounds to make your profile pop!
      </Button>
    </>
  );
}

function SaveButton() {
  const selectedBg = useGetSelectedBg();
  const save = useSaveAction();
  if (!selectedBg) return null;
  return <Button onClick={save}>Save</Button>;
}
