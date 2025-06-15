"use client";

import type { ButtonProps } from "@votewise/ui/button";
import type Link from "next/link";

import { useTransition } from "react";

import { makeToast } from "@votewise/ui/toast";

import { onboard } from "@/app/onboard/action";

import { chain } from "@/lib/chain";
import { uploadClient } from "@/lib/client";
import { routes } from "@/lib/routes";

import { useGetSavedAvatar } from "../_utils/store";

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
      startTransition(async () => {
        const res = await onboard({ step: 3, avatar: uploadRes.data.url, isDirty: true });
        if (!res.success) {
          makeToast.error("Ooop!", res.error);
        }
      });
      return;
    }

    startTransition(async () => {
      const res = await onboard({ step: 3, avatar: savedAvatar, isDirty: initialAvatar !== savedAvatar });
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
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
