"use client";

import { useTransition } from "react";

import { Logout as LogoutIcon } from "@votewise/ui/icons/logout";
import { Spinner } from "@votewise/ui/ring-spinner";

import { logoutAction } from "./logout-action";

const className =
  "py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors text-black-200 text-sm font-medium focus-visible";

export function Logout() {
  const [isPending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  const spinner = isPending ? <Spinner className="size-5 ml-2" /> : null;

  return (
    <button className={className} onClick={logout} disabled={isPending}>
      <LogoutIcon />
      <span>Logout</span>
      {spinner}
    </button>
  );
}
