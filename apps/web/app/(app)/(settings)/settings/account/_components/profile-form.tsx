"use client";

import type { GetMyAccountResponse } from "@votewise/client/user";
import type { TFormFields } from "../_hooks/use-profile-form";

import { Button } from "@votewise/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Input } from "@votewise/ui/input";
import { Textarea } from "@votewise/ui/textarea";

import { useProfileForm } from "../_hooks/use-profile-form";

type Props = { account: GetMyAccountResponse };
type Field = {
  name: TFormFields;
  label: string;
  placeholder: string;
  type: "input" | "textarea";
};

const inputClasses = "h-10 bg-nobelBlack-200 border-black-400";
const labelClassname = "text-sm text-gray-400";
const fields: Field[] = [
  { name: "email", label: "Email", placeholder: "Email", type: "input" },
  { name: "username", label: "Username", placeholder: "Username", type: "input" },
  { name: "first_name", label: "First name", placeholder: "First name", type: "input" },
  { name: "last_name", label: "Last name", placeholder: "Last name", type: "input" },
  { name: "about", label: "About", placeholder: "About", type: "textarea" },
  { name: "location", label: "Location", placeholder: "Location", type: "input" },
  { name: "facebook", label: "Facebook", placeholder: "Facebook URL", type: "input" },
  { name: "instagram", label: "Instagram", placeholder: "Instagram URL", type: "input" },
  { name: "twitter", label: "Twitter", placeholder: "Twitter URL", type: "input" }
];

export function ProfileForm(props: Props) {
  const { form, getButtonProps, getFormFieldProps } = useProfileForm(props);
  return (
    <div className="flex flex-col gap-4">
      <Form {...form}>
        {fields.map((field) => (
          <FormField {...getFormFieldProps(field.name, { className: "gap-1" })} key={field.name}>
            <FormLabel className={labelClassname}>{field.label}</FormLabel>
            <FormControl>
              {field.type === "input" ? (
                <Input className={inputClasses} placeholder={field.placeholder} {...form.register(field.name)} />
              ) : (
                <Textarea
                  placeholder={field.placeholder}
                  className="bg-nobelBlack-200 border-black-400"
                  {...form.register(field.name)}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormField>
        ))}
        <Button {...getButtonProps({ className: "mt-3" })}>Edit profile</Button>
      </Form>
    </div>
  );
}
