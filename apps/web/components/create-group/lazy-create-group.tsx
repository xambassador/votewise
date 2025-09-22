import { useCreateGroup } from "@/hooks/use-create-group";

import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Dash } from "@votewise/ui/icons/dash";
import { ImagePicker, ImagePickerButton, ImagePreview, ResetPreviewButton } from "@votewise/ui/image-picker";
import { Input } from "@votewise/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";
import { Textarea } from "@votewise/ui/textarea";

export function CreateGroup(props: React.ComponentProps<typeof Dialog>) {
  const form = useCreateGroup(props);
  return (
    <Dialog {...form.getDialogProps()}>
      <DialogContent className="p-12 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="text-2xl text-gray-300 font-normal">Create new group</DialogTitle>
        <DialogDescription className="sr-only">Start a new group</DialogDescription>
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
            <ImagePicker className="w-full max-h-[140px]">
              <ImagePreview imageWrapperProps={{ className: "rounded-lg" }} />
              <ImagePickerButton {...form.getImagePickerButtonProps()} />
              <ResetPreviewButton className="rounded-lg" />
            </ImagePicker>
          </div>
        </Form>
        <Dash className="text-nobelBlack-200" />
        <Button {...form.getButtonProps({ children: "Create" })} />
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
