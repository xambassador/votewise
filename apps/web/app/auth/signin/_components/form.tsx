"use client";

import type { TSinginForm } from "../_utils";

import Link from "next/link";
import { routes } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@votewise/ui/button";
import { UsernameInput } from "@votewise/ui/email-input";
import { Form, FormControl, FormField, FormLabel, FormMessage, useForm } from "@votewise/ui/form";
import { PasswordInput } from "@votewise/ui/password-input";

import { ZSingInFormSchema } from "../_utils";

export function SignInForm() {
  const form = useForm<TSinginForm>({ resolver: zodResolver(ZSingInFormSchema) });

  const onSubmit = form.handleSubmit(() => {});

  return (
    <Form {...form}>
      <div className="flex flex-col gap-3 min-w-[calc((450/16)*1rem)]">
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
      <div className="flex items-center justify-between">
        <Button className="w-full" onClick={onSubmit}>
          Let&apos;s Go!
        </Button>
      </div>
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
