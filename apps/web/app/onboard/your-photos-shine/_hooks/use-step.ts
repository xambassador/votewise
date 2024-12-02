"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";
import { chain } from "@/lib/chain";
import { routes } from "@/lib/routes";

import { useGetSavedAvatar } from "../_utils/store";
import { onboard } from "../../action";

type LinkProps = React.ComponentProps<typeof Link>;

export function useStep() {
  const [isPending, startTransition] = useTransition();
  const savedAvatar = useGetSavedAvatar();

  async function onSubmit() {
    if (!savedAvatar) return;
    const res = await fetch(savedAvatar);
    await res.blob();
    startTransition(async () => {
      await onboard({ redirectTo: routes.onboard.step4() });
    });
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { ...props, onClick: chain(onSubmit, props?.onClick), loading: isPending || props?.loading };
  }

  function getBackProps(props?: LinkProps): LinkProps {
    return { ...props, href: routes.onboard.step2() };
  }

  return { getButtonProps, getBackProps };
}
