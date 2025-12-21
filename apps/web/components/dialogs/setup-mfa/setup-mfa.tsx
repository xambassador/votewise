import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";

import { MFAForm } from "@/components/mfa-form";

export function SetupMFA(
  props: React.ComponentProps<typeof MFAForm> & { dialogProps?: React.ComponentProps<typeof Dialog> }
) {
  const { dialogProps, ...rest } = props;
  return (
    <Dialog {...dialogProps}>
      <DialogContent className="sm:p-12 px-5 py-8 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="sr-only">Setup Authenticator App</DialogTitle>
        <DialogDescription className="sr-only">
          Secure your account by setting up Multi-Factor Authentication (MFA) using an authenticator app.
        </DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />
        <MFAForm {...rest}>{props.children}</MFAForm>
      </DialogContent>
    </Dialog>
  );
}
