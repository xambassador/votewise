"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";

import { makeToast } from "@votewise/ui/toast";

import { chain } from "@/lib/chain";
import { uploadClient } from "@/lib/client";
import { routes } from "@/lib/routes";

import { useGetSavedAvatar } from "../_utils/store";
import { onboard } from "../../action";

type LinkProps = React.ComponentProps<typeof Link>;

export function useStep() {
  const [isPending, startTransition] = useTransition();
  const savedAvatar = useGetSavedAvatar();

  async function onSubmit() {
    if (!savedAvatar) return;
    if (savedAvatar instanceof File) {
      const uploadRes = await uploadClient.upload(savedAvatar);
      if (!uploadRes.success) {
        makeToast.error("Oops!", uploadRes.error);
        return;
      }
      startTransition(() => {
        onboard({ step: 3, avatar: uploadRes.data.url });
      });
      return;
    }

    startTransition(() => {
      onboard({ step: 3, avatar: savedAvatar });
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
