"use client";

import type { GetMyAccountResponse } from "@votewise/client/user";

import { Fragment } from "react";
import { useFetchMyAccount } from "@/hooks/use-fetch-my-account";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import { Error } from "@votewise/ui/error";
import { Separator } from "@votewise/ui/separator";

import { ChangePassword } from "@/components/dialogs/change-password";

import { MFA } from "./mfa";
import { ProfileForm } from "./profile-form";
import { AccountSettingsSkeleton } from "./skeleton";

type Props = {
  data: GetMyAccountResponse;
};

export function AccountSettings(props: Props) {
  const { data, status, error } = useFetchMyAccount(props.data);

  switch (status) {
    case "pending":
      return <AccountSettingsSkeleton />;
    case "error":
      return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
  }

  const name = data.first_name + " " + data.last_name;
  const isTotpEnabled = data.factors.find((factor) => factor.factor_type === "TOTP");

  return (
    <Fragment>
      <h1 className="text-xl text-gray-300 font-semibold">Account</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarFallback name={name} />
            <AvatarImage src={data.avatar_url ?? ""} alt={name} sizes="80px" />
          </Avatar>
          <div className="flex flex-col">
            <span className="text-gray-300 font-medium">{name}</span>
            <span className="text-gray-400 text-sm">{data.user_name}</span>
          </div>
        </div>
        <ProfileForm account={data} />
      </div>
      <Separator className="w-full h-px" />
      <h1 className="text-xl text-gray-300 font-semibold">Security</h1>
      <div className="flex flex-col gap-4">
        <MFA isTotpEnabled={!!isTotpEnabled} factorId={isTotpEnabled?.id} />
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Change Password</span>
          <ChangePassword variant="secondary" size="md" />
        </div>
      </div>
      <Separator className="w-full h-px" />
      <h1 className="text-xl text-gray-300 font-semibold">Danger Zone</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Delete Account</span>
          <Button variant="danger" size="md">
            Delete
          </Button>
        </div>
      </div>
    </Fragment>
  );
}
