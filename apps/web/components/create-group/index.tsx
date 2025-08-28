import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@votewise/ui/dialog";
import { Dash } from "@votewise/ui/icons/dash";
import { ImagePicker, ImagePickerButton, ImagePreview, ResetPreviewButton } from "@votewise/ui/image-picker";
import { Input } from "@votewise/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";
import { Textarea } from "@votewise/ui/textarea";

export function CreateGroup() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Create group</Button>
      </DialogTrigger>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="text-2xl text-gray-300 font-normal">Create new group</DialogTitle>
        <DialogDescription className="sr-only">Start a new group</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />

        <div className="flex flex-col gap-5">
          <Input placeholder="Group name" />
          <Textarea placeholder="Group description" />
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Group type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
          <ImagePicker className="w-full max-h-[140px]">
            <ImagePreview
              imageWrapperProps={{
                className: "rounded-lg"
              }}
            />
            <ImagePickerButton />
            <ResetPreviewButton className="rounded-lg" />
          </ImagePicker>
        </div>
        <Dash className="text-nobelBlack-200" />
        <Button>Create</Button>
      </DialogContent>
    </Dialog>
  );
}
