"use client";

import type { Dialog } from "@votewise/ui/dialog";

import { useEffect } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";

/* ----------------------------------------------------------------------------------------------- */
type DialogProps = React.ComponentProps<typeof Dialog>;

/* -----------------------------------------------------------------------------------------------
 * Atoms
 * -----------------------------------------------------------------------------------------------*/
const isDialogOpen = atom(false);
const isChooseAvatarDialogOpen = atom(false);

/**
 * Atom used to store the image URL of the image either from choosing from the list or from file drop.
 */
const selectedAvatarAtom = atom<string | File | null>(null);

/**
 * Atom to store the final selected avatar from either the list or file drop.
 */
const savedAvatarAtom = atom<string | File | null>(null);

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
  set(isChooseAvatarDialogOpen, false);
});
const onFileDropAtom = atom(null, (_, set, files: File[]) => {
  const file = files[0];
  set(selectedAvatarAtom, file);
});

/* -----------------------------------------------------------------------------------------------
 * Setters
 * -----------------------------------------------------------------------------------------------*/
export function useSetDialogOpen() {
  return useSetAtom(isDialogOpen);
}

export function useSetChooseAvatarDialogOpen() {
  return useSetAtom(isChooseAvatarDialogOpen);
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

export function useSetSavedAvatar() {
  return useSetAtom(savedAvatarAtom);
}

export function useResetSelection() {
  const setSelectedAvatar = useSetAtom(selectedAvatarAtom);
  const setSavedAvatar = useSetAtom(savedAvatarAtom);
  return () => {
    setSelectedAvatar(null);
    setSavedAvatar(null);
  };
}

export function useSetSelectedAvatar(url: string | File | null | undefined) {
  const setter = useSetAtom(selectedAvatarAtom);
  useEffect(() => {
    if (!url) return;
    setter(url);
  }, [setter, url]);
}

/* -----------------------------------------------------------------------------------------------
 * Getters
 * -----------------------------------------------------------------------------------------------*/
export function useGetDialogOpen() {
  return useAtomValue(isDialogOpen);
}

export function useGetSelectedAvatar() {
  const selectedAvatar = useAtomValue(selectedAvatarAtom);
  if (selectedAvatar instanceof File) {
    return URL.createObjectURL(selectedAvatar);
  }
  return selectedAvatar;
}

export function useGetSavedAvatar() {
  return useAtomValue(savedAvatarAtom);
}

export function useGetDialogProps(props?: DialogProps): DialogProps {
  const open = useGetDialogOpen();
  const setDialogOpen = useSetDialogOpen();
  return { ...props, open, onOpenChange: setDialogOpen };
}

export function useGetChooseAvatarDialogProps(props?: DialogProps): DialogProps {
  const open = useAtomValue(isChooseAvatarDialogOpen);
  const setDialogOpen = useSetChooseAvatarDialogOpen();
  return { ...props, open, onOpenChange: setDialogOpen };
}
