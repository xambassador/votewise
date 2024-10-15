"use client";

import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { SeparatorWithLabel } from "@votewise/ui/separator";

import { useGetDialogProps, useGetSelectedAvatar, useSaveAction, useSetChooseAvtarDialogOpen } from "../_utils/store";
import { AvatarDropZone } from "./avatar-dropzone";

/* ----------------------------------------------------------------------------------------------- */

export function AvatarPickerDialog() {
  const props = useGetDialogProps();
  return (
    <Dialog {...props}>
      <DialogContent className="p-12">
        <DialogTitle className="sr-only">Choose an Avatar</DialogTitle>
        <DialogDescription className="sr-only">Choose an avatar to express your style!</DialogDescription>
        <div className="flex flex-col gap-10">
          <AvatarDropZone />
          <SeparatorWithLabel>Or</SeparatorWithLabel>
          <div className="flex flex-col gap-2">
            <ChooseAvatarButton />
            <SaveButton />
          </div>
        </div>
        <Close />
      </DialogContent>
    </Dialog>
  );
}

function ChooseAvatarButton() {
  const setDialogOpen = useSetChooseAvtarDialogOpen();
  return (
    <Button variant="secondary" onClick={() => setDialogOpen(true)}>
      Or choose from our awesome avatars to express your style!
    </Button>
  );
}

function SaveButton() {
  const selectedAvatar = useGetSelectedAvatar();
  const save = useSaveAction();
  if (!selectedAvatar) return null;
  return <Button onClick={save}>Save</Button>;
}
