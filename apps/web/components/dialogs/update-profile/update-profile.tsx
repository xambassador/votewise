"use client";

import { useEditProfile } from "@/hooks/use-edit-profile";
import { useUploadAsset } from "@/hooks/use-upload";

import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { ImagePicker, ImagePickerButton, ImagePreview, ResetPreviewButton } from "@votewise/ui/image-picker";
import { Input } from "@votewise/ui/input";
import { Textarea } from "@votewise/ui/textarea";
import { makeToast } from "@votewise/ui/toast";

import { EditImage } from "@/components/edit-image";

export type Profile = {
  avatarUrl: string | null;
  coverImageUrl: string | null;
  firstName: string;
  lastName: string;
  about: string;
};
type Props = React.ComponentProps<typeof Dialog> & {
  profile: Profile;
};

export function UpdateProfile(props: Props) {
  const form = useEditProfile(props);
  return (
    <Dialog {...form.getDialogProps()}>
      <DialogContent className="p-12 flex flex-col gap-8">
        <DialogTitle className="sr-only">Update your profile</DialogTitle>
        <DialogDescription className="sr-only">Update your profile details</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />

        <div className="relative">
          <CoverPicker defaultUrl={props.profile.coverImageUrl} onUploadDone={(url) => form.updateUrl("cover", url)} />
          <ProfilePicker defaultUrl={props.profile.avatarUrl} onUploadDone={(url) => form.updateUrl("avatar", url)} />
        </div>

        <Form {...form.getRootFormProps()}>
          <div className="flex flex-col gap-4 mt-10">
            <FormField {...form.getFormFieldProps("first_name")}>
              <FormLabel className="sr-only">First name</FormLabel>
              <FormControl>
                <Input placeholder="First name" {...form.register("first_name")} />
              </FormControl>
              <FormMessage />
            </FormField>
            <FormField {...form.getFormFieldProps("last_name")}>
              <FormLabel className="sr-only">Last name</FormLabel>
              <FormControl>
                <Input placeholder="Last name" {...form.register("last_name")} />
              </FormControl>
              <FormMessage />
            </FormField>
            <FormField {...form.getFormFieldProps("about")}>
              <FormLabel className="sr-only">About</FormLabel>
              <FormControl>
                <Textarea placeholder="About" {...form.register("about")} />
              </FormControl>
              <FormMessage />
            </FormField>
          </div>
          <Button {...form.getButtonProps({ className: "w-full", children: "Save" })} />
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type ImgPickerProps = { defaultUrl: string | null; onUploadDone: (url: string) => void };

function ProfilePicker(props: ImgPickerProps) {
  const uploader = useUploadAsset({
    onUploadDone: props.onUploadDone,
    onError: (t, err) => {
      if (t === "validation") {
        makeToast.error("Image is too large.", err);
      }
    }
  });
  return (
    <>
      <ImagePicker {...uploader.getImagePickerProps({ className: "size-20 absolute -bottom-10 left-5" })}>
        <ImagePreview defaultUrl={props.defaultUrl ?? ""} />
        <ResetPreviewButton />
        <ImagePickerButton
          {...uploader.getImagePickerButtonProps({
            className: "size-8 -right-2 bottom-0",
            iconProps: { className: "size-5" },
            updatePreview: false
          })}
        />
      </ImagePicker>
      <EditImage
        {...uploader.getEditorProps()}
        cropperProps={{ aspect: 1, circularCrop: true, maxWidth: 600, minWidth: 120, minHeight: 120 }}
      />
    </>
  );
}

function CoverPicker(props: ImgPickerProps) {
  const uploader = useUploadAsset({
    onUploadDone: props.onUploadDone,
    onError: (t, err) => {
      if (t === "validation") {
        makeToast.error("Image is too large.", err);
      }
    }
  });
  return (
    <>
      <ImagePicker {...uploader.getImagePickerProps({ className: "w-full max-h-[calc((200/16)*1rem)] rounded-3xl" })}>
        <ImagePreview defaultUrl={props.defaultUrl ?? ""} imageWrapperProps={{ className: "rounded-3xl" }} />
        <ResetPreviewButton className="rounded-3xl" />
        <ImagePickerButton
          {...uploader.getImagePickerButtonProps({ className: "bottom-4 right-4", updatePreview: false })}
        />
      </ImagePicker>
      <EditImage
        {...uploader.getEditorProps()}
        cropperProps={{ minWidth: 600, minHeight: 200, maxWidth: 600, maxHeight: 200 }}
      />
    </>
  );
}
