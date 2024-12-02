"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";
import { chain } from "@/lib/chain";
import { routes } from "@/lib/routes";

import { onboard } from "../../action";

type LinkProps = React.ComponentProps<typeof Link>;

export function useStep() {
  const [isPending, startTransition] = useTransition();

  function onSubmit() {
    startTransition(async () => {
      await onboard({ redirectTo: routes.onboard.step5() });
    });
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { ...props, onClick: chain(onSubmit, props?.onClick), loading: isPending || props?.loading };
  }

  function getBackProps(props?: LinkProps): LinkProps {
    return { ...props, href: routes.onboard.step3() };
  }

  return { getButtonProps, getBackProps };
}
