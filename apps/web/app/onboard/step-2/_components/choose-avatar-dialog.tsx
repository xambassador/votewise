"use client";

import { AvatarList } from "@votewise/ui/avatar-list";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";

import { useGetChooseAvtarDialogProps, useSelectAvatarFromList } from "../_utils/store";

export function ChooseAvatarDialog() {
  const props = useGetChooseAvtarDialogProps();
  const selectAvatar = useSelectAvatarFromList();

  return (
    <Dialog {...props}>
      <DialogContent className="p-12">
        <DialogTitle className="text-2xl text-gray-400 font-medium">Pick Your Perfect Avatar!</DialogTitle>
        <DialogDescription className="sr-only">Choose an avatar to express your style!</DialogDescription>
        <AvatarList onSelect={(url) => selectAvatar(url)} />
        <Close />
      </DialogContent>
    </Dialog>
  );
}
