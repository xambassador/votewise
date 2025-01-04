"use client";

import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Input, InputField } from "@votewise/ui/input-field";

import { Footer } from "@/app/(app)/onboard/_components/footer";

import { useStep } from "../_hooks/use-step";
import { fields } from "./fields";

export function SocialsForm() {
  const { form, getFormProps, getButtonProps, getBackProps } = useStep();
  return (
    <Form {...form}>
      <form {...getFormProps({ className: "flex flex-col gap-10" })}>
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <FormField key={field.name} name={field.name}>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <InputField>
                  <Input type={field.type} placeholder={field.placeholder} {...form.register(field.name)} />
                </InputField>
              </FormControl>
              <FormMessage />
            </FormField>
          ))}
        </div>
        <Footer nextProps={getButtonProps()} backProps={getBackProps()} />
      </form>
    </Form>
  );
}
