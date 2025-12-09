"use client";

import { useTransition } from "react";

import { Logout as LogoutIcon } from "@votewise/ui/icons/logout";
import { Spinner } from "@votewise/ui/ring-spinner";

import { cn } from "@/lib/cn";

import { logoutAction } from "./logout-action";

const className =
  "py-2 pl-2 pr-1 rounded flex items-center gap-2 hover:bg-nobelBlack-200 transition-colors text-black-200 text-lg font-medium focus-visible";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Logout(props: Props) {
  const [isPending, startTransition] = useTransition();

  function logout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  const spinner = isPending ? <Spinner className="size-5 ml-2" /> : null;

  return (
    <button {...props} className={cn(className, props.className)} onClick={logout} disabled={isPending}>
      <LogoutIcon className="ml-1" />
      <span className="hidden xl:inline-block">Logout</span>
      {spinner}
    </button>
  );
}
