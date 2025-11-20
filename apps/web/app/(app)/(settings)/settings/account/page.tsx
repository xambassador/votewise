import { Fragment } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Button } from "@votewise/ui/button";
import { Error } from "@votewise/ui/error";
import { ChevronRight } from "@votewise/ui/icons/chevron-right";
import { Separator } from "@votewise/ui/separator";

import { getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

import { ProfileForm } from "./_components/profile-form";

export default async function Page() {
  const userClient = getUserClient();
  const res = await userClient.getMyAccount();
  if (!res.success) {
    return <Error error={res.error} />;
  }

  const name = res.data.first_name + " " + res.data.last_name;
  const isTotpEnabled = res.data.factors.find((factor) => factor.factor_type === "TOTP");

  return (
    <Fragment>
      <Link href={routes.settings.root()} className="flex items-center gap-1 text-gray-400 text-sm">
        <ChevronRight className="rotate-180 size-4" />
        <span>Back to Settings</span>
      </Link>
      <h1 className="text-xl text-gray-300">Account</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-20">
            <AvatarFallback name={name} />
            <AvatarImage src={res.data.avatar_url} alt={name} />
          </Avatar>
          <div className="flex flex-col">
            <span className="text-gray-300 font-medium">{name}</span>
            <span className="text-gray-400 text-sm">{res.data.user_name}</span>
          </div>
        </div>
        <ProfileForm account={res.data} />
      </div>
      <Separator className="w-full h-px" />
      <h1 className="text-xl text-gray-300">Security</h1>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Two-Factor Authentication</span>
          <Button variant={isTotpEnabled ? "danger" : "primary"} size="md">
            {isTotpEnabled ? "Disable 2FA" : "Enable 2FA"}
          </Button>
        </div>
      </div>
      <Separator className="w-full h-px" />
      <h1 className="text-xl text-gray-300">Danger Zone</h1>
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
