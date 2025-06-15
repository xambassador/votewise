"use client";

import type { TTellUsAboutYou } from "@/app/onboard/_utils/schema";

import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";
import { Textarea } from "@votewise/ui/textarea";

import { Footer } from "@/app/onboard/_components/footer";

import { useStep } from "../_hooks/use-step";

export function OnboardForm(props: { defaultValue?: TTellUsAboutYou }) {
  const {
    form,
    getFormFieldProps,
    getGenderFieldProps,
    getFormProps,
    getButtonProps,
    getAboutFieldProps,
    getBackButtonProps
  } = useStep(props);

  return (
    <Form {...form}>
      <form {...getFormProps({ className: "flex flex-col gap-12" })}>
        <div className="flex flex-col gap-6">
          <FieldController
            {...getGenderFieldProps()}
            render={({ field }) => (
              <FormField {...getFormFieldProps("gender")}>
                <FormLabel>Gender</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger ref={field.ref}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormField>
            )}
          />
          <FormField {...getFormFieldProps("about")}>
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea {...getAboutFieldProps()} />
            </FormControl>
            <FormMessage />
          </FormField>
        </div>

        <Footer nextProps={getButtonProps()} backProps={getBackButtonProps()} />
      </form>
    </Form>
  );
}
