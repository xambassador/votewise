"use client";

import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";

import { Copy } from "@votewise/ui/icons/copy";
import { Input, InputField } from "@votewise/ui/input-field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@votewise/ui/otp-input";

export function AuthenticatorForm() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const uri =
      "otpauth://totp/Votewise:yash%40gmail.com?secret=PRUSIPY6PNKUKQJH&period=30&digits=6&algorithm=SHA1&issuer=Votewise";
    toDataURL(uri, (err, url) => {
      if (err) {
        return;
      }

      setQrUrl(url);
    });
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl text-gray-300">Set up Authenticator App</h2>
        <p className="text-sm text-gray-400">
          Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h3 className="text-gray-300 text-sm">1. Scan this QR code with your authenticator app</h3>
          <div className="rounded-[1.25rem] bg-nobelBlack-200 py-6 grid place-items-center min-h-[10.625rem] max-h-[10.625rem]">
            {qrUrl && <QRCode url={qrUrl ?? ""} />}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-gray-300 text-sm">2. Or manually enter this setup key</h3>
          <InputField>
            <Input value="ABCD EFGH IJKL MNOP" />
            <button>
              <Copy className="text-black-300" />
            </button>
          </InputField>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-gray-300 text-sm">3. Enter the 6-digit verification code</h3>
          <InputOTP maxLength={6}>
            <InputOTPGroup className="justify-between w-full">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>
    </div>
  );
}

function QRCode({ url }: { url: string }) {
  return (
    <div className="size-[7.5rem] bg-white-50 relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="QR" className="size-full absolute inset-0 object-cover rounded-lg" />
    </div>
  );
}
