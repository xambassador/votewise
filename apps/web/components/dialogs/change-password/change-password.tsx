import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Dash } from "@votewise/ui/icons/dash";
import { PasswordHintTooltip } from "@votewise/ui/password-hint-tooltip";
import { PasswordInput } from "@votewise/ui/password-input";
import { PasswordStrength } from "@votewise/ui/password-strength";

import { useChangePassword } from "@/app/(app)/(settings)/settings/account/_hooks/use-change-password";

export function ChangePassword(props: React.ComponentProps<typeof Dialog>) {
  const form = useChangePassword(props);
  return (
    <Dialog {...form.getDialogProps()}>
      <DialogContent className="sm:p-12 px-5 py-8 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="text-2xl text-gray-300 font-normal">Change password</DialogTitle>
        <DialogDescription className="sr-only">
          Update your account password here. Make sure to choose a strong and secure password to protect your account.
        </DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />

        <Form {...form.getRootFormProps()}>
          <div className="flex flex-col gap-5">
            <FormField {...form.getFormFieldProps("old_password")}>
              <FormLabel className="sr-only">Old password</FormLabel>
              <FormControl>
                <PasswordInput showPadLock={false} placeholder="Old password" {...form.register("old_password")} />
              </FormControl>
              <FormMessage />
            </FormField>
            <FormField {...form.getFormFieldProps("new_password")}>
              <FormLabel className="sr-only">New password</FormLabel>
              <FormControl>
                <PasswordInput showPadLock={false} placeholder="New password" {...form.register("new_password")} />
              </FormControl>
              <FormMessage />
            </FormField>
            <div className="flex items-center justify-between flex-wrap">
              <PasswordStrength password={form.password} />
              <PasswordHintTooltip password={form.password} tooltipContentProps={{ style: { zIndex: 50 } }} />
            </div>
          </div>
        </Form>
        <Dash className="text-nobelBlack-200" />
        <Button {...form.getButtonProps({ children: "Update" })} />
      </DialogContent>
    </Dialog>
  );
}
