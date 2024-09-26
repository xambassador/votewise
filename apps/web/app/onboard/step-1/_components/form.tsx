"use client";

import { Button } from "@votewise/ui/button";
import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Textarea } from "@votewise/ui/textarea";

import { useStepOne } from "../_hooks/use-step-1";

export function OnboardForm() {
  const { getName, getRootFormProps, getGenderFieldProps, getFormProps, getButtonProps, getAboutFieldProps } =
    useStepOne();

  return (
    <Form {...getRootFormProps()}>
      <form {...getFormProps({ className: "flex flex-col gap-12" })}>
        <div className="flex flex-col gap-6">
          <FieldController {...getGenderFieldProps()} />
          <FormField name={getName("about")}>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea {...getAboutFieldProps()} />
            </FormControl>
            <FormMessage />
          </FormField>
        </div>
        <Button {...getButtonProps()} />
      </form>
    </Form>
  );
}
