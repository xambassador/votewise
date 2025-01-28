"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";

import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";
import { uploadClient } from "@/lib/client";
import { routes } from "@/lib/routes";

import { useGetSavedBg } from "../_utils/store";
import { onboard } from "../../action";

type LinkProps = React.ComponentProps<typeof Link>;

export function useStep() {
  const [isPending, startTransition] = useTransition();
  const savedBg = useGetSavedBg();

  async function onSubmit() {
    if (!savedBg) return;
    if (savedBg instanceof File) {
      const uploadRes = await uploadClient.upload(savedBg);
      if (!uploadRes.success) {
        makeToast.error("Ooop!", uploadRes.error);
        return;
      }
      startTransition(() => {
        onboard({ cover: uploadRes.data.url, step: 4 });
      });
      return;
    }
    startTransition(() => {
      onboard({ cover: savedBg, step: 4 });
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
