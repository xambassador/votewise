"use client";

import { useMediaQuery } from "react-responsive";

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
      <DialogContent className="sm:p-12 p-5">
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
        <Close className="sm:top-5 sm:right-5 top-2 right-2" />
      </DialogContent>
    </Dialog>
  );
}

function ChooseBgButton() {
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const setOpen = useSetChooseBgDialogOpen();
  const label = isMobile ? "Choose Background" : "Choose from our stunning backgrounds to make your profile pop!";
  return (
    <>
      <ChooseBackgroundDialog />
      <Button onClick={() => setOpen(true)} variant="secondary">
        {label}
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
