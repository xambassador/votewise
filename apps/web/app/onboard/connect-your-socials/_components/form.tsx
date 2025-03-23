"use client";

import type { TConnectYourSocials } from "@/app/onboard/_utils/schema";

import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Input, InputField } from "@votewise/ui/input-field";

import { Footer } from "@/app/onboard/_components/footer";

import { useStep } from "../_hooks/use-step";
import { fields } from "./fields";

type Props = { defaultValues?: TConnectYourSocials & { name?: string } };

export function SocialsForm(props?: Props) {
  const { defaultValues } = props || {};
  const { form, getFormProps, getButtonProps, getBackProps } = useStep({ defaultValues });
  return (
    <Form {...form}>
      <form {...getFormProps({ className: "flex flex-col gap-10" })}>
        <div className="flex flex-col gap-4">
          {fields({ name: defaultValues?.name }).map((field) => (
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
