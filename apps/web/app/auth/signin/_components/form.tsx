"use client";

import type { TSinginForm } from "../_utils";

import Link from "next/link";
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
          <FormLabel className="sr-only">Username or email address</FormLabel>
          <FormControl>
            <UsernameInput placeholder="Username or email address" {...form.register("username")} />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField name="password">
          <FormLabel className="sr-only">Password</FormLabel>
          <FormControl>
            <PasswordInput placeholder="Password" {...form.register("password")} />
          </FormControl>
          <FormMessage />
        </FormField>
      </div>

      <Link href="/forgot" className="font-medium text-sm text-gray-500 w-fit">
        Forgot?
      </Link>

      <div className="flex items-center justify-between">
        <Button asChild variant="secondary">
          <Link role="button" href="/signup">
            Back
          </Link>
        </Button>
        <Button onClick={onSubmit}>Sign in</Button>
      </div>
    </Form>
  );
}
