"use client";

import { useMediaQuery } from "react-responsive";

import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { SeparatorWithLabel } from "@votewise/ui/separator";

import {
  useGetDialogProps,
  useGetSelectedAvatar,
  useSaveAction,
  useSetChooseAvatarDialogOpen,
  useSetSelectedAvatar
} from "../_utils/store";
import { AvatarDropZone } from "./avatar-dropzone";
import { AvatarEditor } from "./avatar-editor";

/* ----------------------------------------------------------------------------------------------- */

type Props = {
  url?: string;
};

export function AvatarPickerDialog(props: Props) {
  const { url } = props;
  const dialogProps = useGetDialogProps();
  useSetSelectedAvatar(url);

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="sm:p-12 p-5">
        <DialogTitle className="sr-only">Choose an Avatar</DialogTitle>
        <DialogDescription className="sr-only">Choose an avatar to express your style!</DialogDescription>
        <div className="flex flex-col gap-10 w-full">
          <AvatarDropZone />
          <AvatarEditor />
          <SeparatorWithLabel>Or</SeparatorWithLabel>
          <div className="flex flex-col gap-2">
            <ChooseAvatarButton />
            <SaveButton />
          </div>
        </div>
        <Close className="sm:top-5 sm:right-5 top-2 right-2" />
      </DialogContent>
    </Dialog>
  );
}

function ChooseAvatarButton() {
  const setDialogOpen = useSetChooseAvatarDialogOpen();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const label = isMobile ? "Choose Avatar" : "Or choose from our awesome avatars to express your style!";
  return (
    <Button variant="secondary" onClick={() => setDialogOpen(true)}>
      {label}
    </Button>
  );
}

function SaveButton() {
  const selectedAvatar = useGetSelectedAvatar();
  const save = useSaveAction();
  if (!selectedAvatar) return null;
  return <Button onClick={save}>Save</Button>;
}
