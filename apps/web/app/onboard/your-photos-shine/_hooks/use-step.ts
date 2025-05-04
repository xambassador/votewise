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
type Props = {
  initialAvatar?: string;
};

export function useStep(props: Props) {
  const { initialAvatar } = props || {};
  const [isPending, startTransition] = useTransition();
  const savedAvatar = useGetSavedAvatar();

  async function onSubmit() {
    if (!savedAvatar) {
      makeToast.error("Oops!", "You forgot to select or add an avatar.");
      return;
    }
    if (savedAvatar instanceof File) {
      const uploadRes = await uploadClient.upload(savedAvatar);
      if (!uploadRes.success) {
        makeToast.error("Oops!", uploadRes.error);
        return;
      }
      startTransition(() => {
        onboard({ step: 3, avatar: uploadRes.data.url, isDirty: true });
      });
      return;
    }

    startTransition(() => {
      onboard({ step: 3, avatar: savedAvatar, isDirty: initialAvatar !== savedAvatar });
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
