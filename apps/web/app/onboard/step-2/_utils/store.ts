"use client";

import type { Dialog } from "@votewise/ui/dialog";

import { atom, useAtomValue, useSetAtom } from "jotai";

/* ----------------------------------------------------------------------------------------------- */
type DialogProps = React.ComponentProps<typeof Dialog>;

/* -----------------------------------------------------------------------------------------------
 * Atoms
 * -----------------------------------------------------------------------------------------------*/
const isDialogOpen = atom(false);
const isChooseAvtarDialogOpen = atom(false);
const selectedAvatarAtom = atom<string | null>(null);
const savedAvatarAtom = atom<string | null>(null);

/* -----------------------------------------------------------------------------------------------
 * Derived Atoms
 * -----------------------------------------------------------------------------------------------*/
const onSaveActionAtom = atom(null, (get, set) => {
  const selectedAvatar = get(selectedAvatarAtom);
  if (!selectedAvatar) return;
  set(savedAvatarAtom, selectedAvatar);
  set(isDialogOpen, false);
});
const onSelectAvatarFromList = atom(null, (_, set, avatar: string) => {
  set(selectedAvatarAtom, avatar);
  set(isChooseAvtarDialogOpen, false);
});
const onFileDropAtom = atom(null, (_, set, files: File[]) => {
  const file = files[0];
  const url = URL.createObjectURL(file);
  set(selectedAvatarAtom, url);
});

/* -----------------------------------------------------------------------------------------------
 * Setters
 * -----------------------------------------------------------------------------------------------*/
export function useSetDialogOpen() {
  return useSetAtom(isDialogOpen);
}

export function useSetChooseAvtarDialogOpen() {
  return useSetAtom(isChooseAvtarDialogOpen);
}

export function useSetSelectedAvatar() {
  return useSetAtom(selectedAvatarAtom);
}

export function useSetSavedAvatar() {
  return useSetAtom(savedAvatarAtom);
}

export function useSaveAction() {
  return useSetAtom(onSaveActionAtom);
}

export function useSelectAvatarFromList() {
  return useSetAtom(onSelectAvatarFromList);
}

export function useOnFileDropAction() {
  return useSetAtom(onFileDropAtom);
}

export function useResetSelection() {
  const setSelectedAvatar = useSetSelectedAvatar();
  const setSavedAvatar = useSetSavedAvatar();
  return () => {
    setSelectedAvatar(null);
    setSavedAvatar(null);
  };
}

/* -----------------------------------------------------------------------------------------------
 * Getters
 * -----------------------------------------------------------------------------------------------*/
export function useGetDialogOpen() {
  return useAtomValue(isDialogOpen);
}

export function useGetChooseAvtarDialogOpen() {
  return useAtomValue(isChooseAvtarDialogOpen);
}

export function useGetSelectedAvatar() {
  return useAtomValue(selectedAvatarAtom);
}

export function useGetSavedAvatar() {
  return useAtomValue(savedAvatarAtom);
}

export function useGetDialogProps(props?: DialogProps): DialogProps {
  const open = useGetDialogOpen();
  const setDialogOpen = useSetDialogOpen();
  return { ...props, open, onOpenChange: setDialogOpen };
}

export function useGetChooseAvtarDialogProps(props?: DialogProps): DialogProps {
  const open = useGetChooseAvtarDialogOpen();
  const setDialogOpen = useSetChooseAvtarDialogOpen();
  return { ...props, open, onOpenChange: setDialogOpen };
}
