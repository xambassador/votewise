"use client";

import type { TSinginForm } from "../_utils";

import { useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { routes } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@votewise/ui/button";
import { UsernameInput } from "@votewise/ui/email-input";
import { Form, FormControl, FormField, FormLabel, FormMessage, useForm } from "@votewise/ui/form";
import { PasswordInput } from "@votewise/ui/password-input";
import { makeToast } from "@votewise/ui/toast";

import { ZSingInFormSchema } from "../_utils";
import { signin } from "../action";

export function SignInForm() {
  const form = useForm<TSinginForm>({ resolver: zodResolver(ZSingInFormSchema) });
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  const onSubmit = form.handleSubmit((data) => {
    startTransition(async () => {
      const res = await signin(data, searchParams.get("redirect"));
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-7 min-w-[calc((450/16)*1rem)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-lg">Account</h1>
            <FormField name="username">
              {usernameLabel}
              <FormControl>
                <UsernameInput placeholder="Username or email address" {...form.register("username")} />
              </FormControl>
              <FormMessage />
            </FormField>

            <FormField name="password">
              {passwordLabel}
              <FormControl>
                <PasswordInput placeholder="Password" {...form.register("password")} />
              </FormControl>
              <FormMessage />
            </FormField>
          </div>
          {forgotLink}
        </div>
        <div className="flex items-center justify-between">
          <Button type="submit" className="w-full" loading={isPending}>
            Let&apos;s Go!
          </Button>
        </div>
      </form>
    </Form>
  );
}

const usernameLabel = <FormLabel className="sr-only">Username or email address</FormLabel>;
const passwordLabel = <FormLabel className="sr-only">Password</FormLabel>;
const forgotLink = (
  <Link href={routes.auth.forgot()} className="font-medium text-sm text-gray-500 w-fit">
    Forgot?
  </Link>
);
