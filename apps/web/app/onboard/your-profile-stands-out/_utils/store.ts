"use client";

import type { Dialog } from "@votewise/ui/dialog";

import { atom, useAtomValue, useSetAtom } from "jotai";

/* ----------------------------------------------------------------------------------------------- */
type DialogProps = React.ComponentProps<typeof Dialog>;

/* -----------------------------------------------------------------------------------------------
 * Atoms
 * -----------------------------------------------------------------------------------------------*/
const isDialogOpenAtom = atom(false);
const isChooseBgDialogOpenAtom = atom(false);
const selectedBgAtom = atom<string | File | null>(null);
const savedBgAtom = atom<string | File | null>(null);

/* -----------------------------------------------------------------------------------------------
 * Derived Atoms
 * -----------------------------------------------------------------------------------------------*/
const onSaveActionAtom = atom(null, (get, set) => {
  const selectedBg = get(selectedBgAtom);
  if (!selectedBg) return;
  set(savedBgAtom, selectedBg);
  set(isDialogOpenAtom, false);
});

const onSelectBgFromList = atom(null, (_, set, bg: string) => {
  set(selectedBgAtom, bg);
  set(isChooseBgDialogOpenAtom, false);
});

const onFileDropAtom = atom(null, (_, set, files: File[]) => {
  const file = files[0];
  set(selectedBgAtom, file);
});

/* -----------------------------------------------------------------------------------------------
 * Setters
 * -----------------------------------------------------------------------------------------------*/
export function useSetDialogOpen() {
  return useSetAtom(isDialogOpenAtom);
}

export function useSetChooseBgDialogOpen() {
  return useSetAtom(isChooseBgDialogOpenAtom);
}

export function useSaveAction() {
  return useSetAtom(onSaveActionAtom);
}

export function useSelectBgFromList() {
  return useSetAtom(onSelectBgFromList);
}

export function useOnFileDropAction() {
  return useSetAtom(onFileDropAtom);
}

export function useResetSelection() {
  const setSelectedBg = useSetAtom(selectedBgAtom);
  const setSavedBg = useSetAtom(savedBgAtom);
  return () => {
    setSelectedBg(null);
    setSavedBg(null);
  };
}

export function useSetSavedBg() {
  return useSetAtom(savedBgAtom);
}

/* -----------------------------------------------------------------------------------------------
 * Getters
 * -----------------------------------------------------------------------------------------------*/
export function useGetDialogOpen() {
  return useAtomValue(isDialogOpenAtom);
}

export function useGetChooseBgDialogOpen() {
  return useAtomValue(isChooseBgDialogOpenAtom);
}

export function useGetSelectedBg() {
  const selectedBg = useAtomValue(selectedBgAtom);
  if (selectedBg instanceof File) return URL.createObjectURL(selectedBg);
  return selectedBg;
}

export function useGetSavedBg() {
  return useAtomValue(savedBgAtom);
}

export function useGetDialogProps(props?: DialogProps): DialogProps {
  const open = useGetDialogOpen();
  const setDialogOpen = useSetDialogOpen();
  return { ...props, open, onOpenChange: () => setDialogOpen(false) };
}

export function useGetChooseBgDialogProps(props?: DialogProps): DialogProps {
  const open = useGetChooseBgDialogOpen();
  const setDialogOpen = useSetChooseBgDialogOpen();
  return { ...props, open, onOpenChange: () => setDialogOpen(false) };
}
