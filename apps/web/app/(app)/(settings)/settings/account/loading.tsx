import { Fragment } from "react";
import Link from "next/link";

import { ChevronRight } from "@votewise/ui/icons/chevron-right";

import { routes } from "@/lib/routes";

import { AccountSettingsSkeleton } from "./_components/skeleton";

export default function Loading() {
  return (
    <Fragment>
      <Link href={routes.settings.root()} className="flex items-center gap-1 text-gray-400 text-sm">
        <ChevronRight className="rotate-180 size-4" />
        <span>Back to Settings</span>
      </Link>
      <AccountSettingsSkeleton />
    </Fragment>
  );
}
