"use client";

import type { TSchema } from "../_hooks/use-step";

import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Input, InputField } from "@votewise/ui/input-field";

import { useStep } from "../_hooks/use-step";
import { Footer } from "../../_components/footer";

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

type Keys = keyof TSchema;
const fields: { name: Keys; label: string; type: string; placeholder: string }[] = [
  { name: "location", label: "Location", type: "text", placeholder: "Where you leave John" },
  { name: "facebook", label: "Facebook", type: "text", placeholder: "Your facebook profile" },
  { name: "instagram", label: "Instagram", type: "text", placeholder: "Your instagram profile" },
  { name: "twitter", label: "Twitter", type: "text", placeholder: "Your twitter profile" }
];
