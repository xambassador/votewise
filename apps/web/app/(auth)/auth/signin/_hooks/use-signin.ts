"use client";

import type { TSinginForm } from "../_utils";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "@votewise/ui/form";
import { makeToast } from "@votewise/ui/toast";

import { ZSingInFormSchema } from "../_utils";
import { signin } from "../action";

export function useSignIn() {
  const form = useForm<TSinginForm>({ resolver: zodResolver(ZSingInFormSchema) });
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const res = await signin(data, searchParams.get("redirect"));
      if (!res.success) makeToast.error("Oops!", res.error);
    });
  });

  return { form, onSubmit, loading: isPending };
}
