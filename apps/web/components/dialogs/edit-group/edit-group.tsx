import { useUploadAsset } from "@/hooks/use-create-group";
import { useEditGroup } from "@/hooks/use-edit-group";

import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Dash } from "@votewise/ui/icons/dash";
import { ImagePickerPill } from "@votewise/ui/image-picker";
import { Input } from "@votewise/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";
import { Textarea } from "@votewise/ui/textarea";

import { EditImage } from "../../edit-image";

export type Group = {
  id: string;
  name: string;
  description: string;
  type: "PUBLIC" | "PRIVATE";
  status: "OPEN" | "CLOSED" | "INACTIVE";
};

type Props = React.ComponentProps<typeof Dialog> & {
  group: Group;
};

export function EditGroup(props: Props) {
  const form = useEditGroup(props);
  return (
    <Dialog {...form.getDialogProps()}>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="text-2xl text-gray-300 font-normal">Update details</DialogTitle>
        <DialogDescription className="sr-only">Update group details</DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />

        <Form {...form.getRootFormProps()}>
          <div className="flex flex-col gap-5">
            <FormField {...form.getFormFieldProps("name")}>
              <FormLabel className="sr-only">Group name</FormLabel>
              <FormControl>
                <Input placeholder="Group name" {...form.register("name")} />
              </FormControl>
              <FormMessage />
            </FormField>
            <FormField {...form.getFormFieldProps("description")}>
              <FormLabel className="sr-only">Group description</FormLabel>
              <FormControl>
                <Textarea placeholder="Group description" {...form.register("description")} />
              </FormControl>
              <FormMessage />
            </FormField>

            <FieldController
              {...form.getFieldControllerProps("type")}
              render={({ field }) => (
                <FormField {...form.getFormFieldProps("type")}>
                  <FormLabel className="sr-only">Group type</FormLabel>
                  <GroupType value={field.value} onValueChange={field.onChange} />
                  <FormMessage />
                </FormField>
              )}
            />

            <FieldController
              {...form.getFieldControllerProps("status")}
              render={({ field }) => (
                <FormField {...form.getFormFieldProps("status")}>
                  <FormLabel className="sr-only">Group status</FormLabel>
                  <GroupStatus value={field.value} onValueChange={field.onChange} />
                  <FormMessage />
                </FormField>
              )}
            />

            <div className="flex flex-col gap-5">
              <span className="text-gray-500 text-sm">Upload new images (optional)</span>
              <UploadLogo onUploadDone={form.onUploadDone} />
              <UploadCover onUploadDone={form.onUploadDone} />
            </div>
          </div>
        </Form>
        <Dash className="text-nobelBlack-200" />
        <Button {...form.getButtonProps({ children: "Update" })} />
      </DialogContent>
    </Dialog>
  );
}

function GroupType(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Group type" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="PUBLIC">Public</SelectItem>
        <SelectItem value="PRIVATE">Private</SelectItem>
      </SelectContent>
    </Select>
  );
}

function GroupStatus(props: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Group status" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="OPEN">Open</SelectItem>
        <SelectItem value="INACTIVE">Inactive</SelectItem>
        <SelectItem value="CLOSED">Closed</SelectItem>
      </SelectContent>
    </Select>
  );
}

type UploadProps = { onUploadDone?: (url: string, type: "LOGO" | "COVER") => void };

function UploadLogo(props: UploadProps) {
  const form = useUploadAsset({ onUploadDone: (url) => props.onUploadDone?.(url, "LOGO") });
  return (
    <>
      <ImagePickerPill {...form.getImagePickerProps({ children: "Upload logo" })} />
      <EditImage
        {...form.getEditorProps({ cropperProps: { minWidth: 200, minHeight: 200, maxWidth: 400, maxHeight: 400 } })}
      />
    </>
  );
}

function UploadCover(props: UploadProps) {
  const form = useUploadAsset({ onUploadDone: (url) => props.onUploadDone?.(url, "COVER") });
  return (
    <>
      <ImagePickerPill {...form.getImagePickerProps({ children: "Upload cover" })} />
      <EditImage
        {...form.getEditorProps({ cropperProps: { minWidth: 600, minHeight: 200, maxWidth: 600, maxHeight: 200 } })}
      />
    </>
  );
}
