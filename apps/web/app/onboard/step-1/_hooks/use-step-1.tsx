"use client";

import type { TAsyncState } from "@/types";
import type { Button } from "@votewise/ui/button";
import type { TFieldControllerProps, TFormProps } from "@votewise/ui/form";
import type { Textarea } from "@votewise/ui/textarea";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";

/* ----------------------------------------------------------------------------------------------- */

const schema = z.object({
  gender: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  about: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" })
});

type HTMLFormProps = React.ComponentProps<"form">;
type TextareaProps = React.ComponentProps<typeof Textarea>;
type ButtonProps = React.ComponentProps<typeof Button>;
type Schema = z.infer<typeof schema>;
type Keys = keyof Schema;
type Props = {
  onSuccess?: (data: Schema) => void;
};

export function useStepOneBase(props: Props) {
  const [status, setStatus] = useState<TAsyncState>("idle");
  const form = useForm<Schema>({
    resolver: zodResolver(schema)
  });

  const action = form.handleSubmit(async (data) => {
    setStatus("loading");
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    props.onSuccess?.(data);
  });

  return { form, status, action };
}

export function useStepOne() {
  const router = useRouter();
  const { form, status, action } = useStepOneBase({
    onSuccess: () => router.push(routes.onboard.step2())
  });

  function getName(key: Keys) {
    return key;
  }

  function getGenderFieldProps(): TFieldControllerProps<Schema> {
    return {
      name: "gender",
      control: form.control,
      render({ field }) {
        return (
          <FormField name="gender">
            <FormLabel>Gender</FormLabel>
            <FormControl>
              {({ id, hasError }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger ref={field.ref} id={id} hasError={hasError}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <FormMessage />
          </FormField>
        );
      }
    };
  }

  function getAboutFieldProps(props?: TextareaProps): TextareaProps {
    return { ...props, ...form.register("about"), placeholder: "About yourself..." };
  }

  function getButtonProps(props?: ButtonProps): ButtonProps {
    return { children: "Next", ...props, type: "submit", loading: status === "loading" };
  }

  function getFormProps(props?: HTMLFormProps): HTMLFormProps {
    return { ...props, onSubmit: action };
  }

  function getRootFormProps(): Omit<TFormProps<Schema>, "children"> {
    return { ...form };
  }

  return { getName, getRootFormProps, getGenderFieldProps, getFormProps, getAboutFieldProps, getButtonProps };
}
