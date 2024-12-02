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

/**
 * Atom used to store the image URL of the image either from choosing from the list or from file drop.
 */
const selectedAvatarAtom = atom<string | null>(null);

/**
 * Atom to store the final selected avatar from either the list or file drop.
 */
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
  const setSelectedAvatar = useSetAtom(selectedAvatarAtom);
  const setSavedAvatar = useSetAtom(savedAvatarAtom);
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
  const open = useAtomValue(isChooseAvtarDialogOpen);
  const setDialogOpen = useSetChooseAvtarDialogOpen();
  return { ...props, open, onOpenChange: setDialogOpen };
}
