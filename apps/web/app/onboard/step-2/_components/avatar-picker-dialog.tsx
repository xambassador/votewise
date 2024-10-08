"use client";

import type { ButtonProps } from "@votewise/ui/button";

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
  const { render, getButtonProps } = useSaveButton();
  return render(<Button {...getButtonProps()}>Save</Button>);
}

function useSaveButton() {
  const selectedAvatar = useGetSelectedAvatar();
  const save = useSaveAction();

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { ...props, disabled: !selectedAvatar, onClick: save };
  }

  function render(children: React.ReactNode) {
    if (!selectedAvatar) return null;
    return children;
  }

  return { getButtonProps, render };
}
