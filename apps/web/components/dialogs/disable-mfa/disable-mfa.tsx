import { Button } from "@votewise/ui/button";
import { Close, Dialog, DialogContent, DialogDescription, DialogTitle } from "@votewise/ui/dialog";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";
import { PasswordInput } from "@votewise/ui/password-input";

import { useDisableMFA } from "@/app/(app)/(settings)/settings/account/_hooks/use-disable-mfa";

export function DisableMFA(props: React.ComponentProps<typeof Dialog> & { factorId: string }) {
  const form = useDisableMFA(props);
  return (
    <Dialog {...form.getDialogProps()}>
      <DialogContent className="sm:p-12 px-5 py-8 max-w-[var(--create-post-modal-width)] flex flex-col gap-8">
        <DialogTitle className="text-2xl text-gray-300 font-normal">Disable Multi-Factor Authentication</DialogTitle>
        <DialogDescription className="sr-only">
          Disable multi-factor authentication by entering your password and the code from your authenticator app.
        </DialogDescription>
        <Close className="absolute top-4 right-5 outline-none focus:ring-2 rounded-full" />
        <Form {...form.getRootFormProps()}>
          <FormField {...form.getFormFieldProps("password")}>
            <FormLabel className="sr-only">Password</FormLabel>
            <FormControl>
              <PasswordInput placeholder="Enter your password" showPadLock={false} {...form.register("password")} />
            </FormControl>
            <FormMessage />
          </FormField>
          <FormField {...form.getFormFieldProps("otp")}>
            <div className="flex flex-col gap-3">
              <span className="text-sm md:text-base text-gray-300 font-normal">
                Enter the 6-digit verification code
              </span>
              <InputOTP maxLength={6} onChange={form.updateOtp}>
                <InputOTPGroup className="justify-between w-full">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <FormMessage />
            </div>
          </FormField>
        </Form>
        <Button {...form.getButtonProps()}>Continue</Button>
      </DialogContent>
    </Dialog>
  );
}
