"use client";

import type { TWhatShouldWeCall } from "@/app/onboard/_utils/schema";

import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Input } from "@votewise/ui/input";

import { Footer } from "@/app/onboard/_components/footer";

import { useStep } from "../_hooks/use-step";

export function StepTwoForm(props: { defaultValues?: TWhatShouldWeCall }) {
  const { getFormFieldProps, form, getInputProps, getNextButtonProps } = useStep(props);
  return (
    <Form {...form}>
      <div className="flex flex-col gap-7">
        <FormField {...getFormFieldProps("userName")}>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input {...getInputProps("userName", { placeholder: "Choose your username" })} />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField {...getFormFieldProps("firstName")}>
          <FormLabel>First name</FormLabel>
          <FormControl>
            <Input {...getInputProps("firstName", { placeholder: "Enter your first name" })} />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField {...getFormFieldProps("lastName")}>
          <FormLabel>Last name</FormLabel>
          <FormControl>
            <Input {...getInputProps("lastName", { placeholder: "Enter your last name" })} />
          </FormControl>
          <FormMessage />
        </FormField>
      </div>
      <Footer nextProps={getNextButtonProps()} shouldShowBackButton={false} />
    </Form>
  );
}
