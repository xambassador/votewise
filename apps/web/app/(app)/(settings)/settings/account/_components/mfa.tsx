"use client";

import { useState, useTransition } from "react";

import { makeToast } from "@votewise/ui/toast";

import { DisableMFA } from "@/components/dialogs/disable-mfa";
import { SetupMFA } from "@/components/dialogs/setup-mfa";

import { enrollMultiFactorAction, verifyMultiFactorAction } from "@/app/action";

export function MFA(props: { isTotpEnabled: boolean; factorId?: string }) {
  const { isTotpEnabled } = props;
  const [isPending, startTransition] = useTransition();
  const [enrollResult, setEnrollResult] = useState<{ qrCode: string; secret: string; id: string } | null>(null);

  function handleToggle2FA() {
    if (isTotpEnabled) {
      // Disable
      return;
    }

    startTransition(async () => {
      const res = await enrollMultiFactorAction();
      if (!res.success) {
        makeToast.error("Failed to enroll in MFA", res.error);
        return;
      }
      setEnrollResult({ qrCode: res.data.totp.qr_code, secret: res.data.totp.secret, id: res.data.id });
    });
  }

  function handleVerifyOTP(otp: string) {
    if (!enrollResult) return;
    startTransition(async () => {
      const res = await verifyMultiFactorAction(
        enrollResult.id,
        otp,
        "Your account is now secure. Please login again to continue."
      );
      if (!res.success) {
        makeToast.error("Failed to verify OTP", res.error);
        return;
      }
    });
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">Two-Factor Authentication</span>
      {!isTotpEnabled && (
        <SetupMFA
          dialogProps={{
            qrCode: enrollResult?.qrCode ?? "",
            secret: enrollResult?.secret ?? "",
            onVerify: handleVerifyOTP,
            submitButtonProps: { loading: isPending }
          }}
          variant={isTotpEnabled ? "danger" : "primary"}
          size="md"
          aria-label="Enable 2FA"
          onClick={handleToggle2FA}
          disabled={isPending}
          loading={isPending}
        >
          Enable 2FA
        </SetupMFA>
      )}
      {isTotpEnabled && props.factorId && (
        <DisableMFA size="md" variant="danger" aria-label="Disable 2FA" factorId={props.factorId}>
          Disable 2FA
        </DisableMFA>
      )}
    </div>
  );
}
