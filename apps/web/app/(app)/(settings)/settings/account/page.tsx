import { Fragment } from "react";
import Link from "next/link";

import { Error } from "@votewise/ui/error";
import { ChevronRight } from "@votewise/ui/icons/chevron-right";

import { getUserClient } from "@/lib/client.server";
import { routes } from "@/lib/routes";

import { AccountSettings } from "./_components/account";

export default async function Page() {
  const userClient = getUserClient();
  const res = await userClient.getMyAccount();
  if (!res.success) {
    return <Error error={res.error} />;
  }

  return (
    <Fragment>
      <Link href={routes.settings.root()} className="flex items-center gap-1 text-gray-400 text-sm">
        <ChevronRight className="rotate-180 size-4" />
        <span>Back to Settings</span>
      </Link>
      <AccountSettings data={res.data} />
    </Fragment>
  );
}
