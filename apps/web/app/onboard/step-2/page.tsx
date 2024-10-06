"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";

import { AvatarList } from "@votewise/ui/avatar-list";
import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { ImagePicker, ImagePickerButton, ImagePreview, ResetPreviewButton } from "@votewise/ui/image-picker";
import { SeparatorWithLabel } from "@votewise/ui/separator";

import { ImageDropZone } from "@/components/image-dropzone";

import { OnboardContainer } from "../_components/container";
import { OnboardHeader, OnboardSubtitle, OnboardTitle } from "../_components/typography";

const avatarPickerModalOpenAtom = atom(false);
const imagePickerModalOpenAtom = atom(false);

export default function Page() {
  const setIsImagePickerOpen = useSetAtom(imagePickerModalOpenAtom);

  return (
    <OnboardContainer>
      <OnboardHeader>
        <OnboardSubtitle>Hello 👋, John</OnboardSubtitle>
        <OnboardTitle>Show off your best shot and let your photos shine!</OnboardTitle>
      </OnboardHeader>
      <ImagePicker className="mx-auto">
        <ImagePreview>
          <ResetPreviewButton />
        </ImagePreview>
        <ImagePickerButton preventDefaultBehavior onClick={() => setIsImagePickerOpen(true)} />
      </ImagePicker>

      <div className="flex flex-col gap-5">
        <Button>Next</Button>
        <Button variant="secondary">Back</Button>
      </div>

      <ImagePickerModal />
      <PickAvatarModal />
    </OnboardContainer>
  );
}

function ImagePickerModal() {
  const isOpen = useAtomValue(imagePickerModalOpenAtom);
  const setImagePickerModalOpen = useSetAtom(imagePickerModalOpenAtom);
  const setAvatarPickerModalOpen = useSetAtom(avatarPickerModalOpenAtom);

  return (
    <Dialog open={isOpen} onOpenChange={setImagePickerModalOpen}>
      <DialogContent className="p-12">
        <DialogTitle className="sr-only">Choose an Avatar</DialogTitle>
        <DialogDescription className="sr-only">Choose an avatar to express your style!</DialogDescription>
        <div className="flex flex-col gap-10">
          <ImageDropZone />
          <SeparatorWithLabel>Or</SeparatorWithLabel>
          <Button
            variant="secondary"
            onClick={() => {
              setAvatarPickerModalOpen(true);
              setImagePickerModalOpen(false);
            }}
          >
            Or choose from our awesome avatars to express your style!
          </Button>
        </div>
        <Close />
      </DialogContent>
    </Dialog>
  );
}

function PickAvatarModal() {
  const isOpen = useAtomValue(avatarPickerModalOpenAtom);
  const setAvatarPickerModalOpen = useSetAtom(avatarPickerModalOpenAtom);

  return (
    <Dialog open={isOpen} onOpenChange={setAvatarPickerModalOpen}>
      <DialogContent className="p-12">
        <DialogTitle className="text-2xl text-gray-400 font-medium">Pick Your Perfect Avatar!</DialogTitle>
        <DialogDescription className="sr-only">Choose an avatar to express your style!</DialogDescription>
        <AvatarList />
        <Close />
      </DialogContent>
    </Dialog>
  );
}
