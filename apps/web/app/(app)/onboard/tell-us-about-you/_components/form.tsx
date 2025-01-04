"use client";

import type { TTellUsAboutYou } from "../../_utils/schema";

import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";
import { Textarea } from "@votewise/ui/textarea";

import { useStep } from "../_hooks/use-step";
import { Footer } from "../../_components/footer";

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
                <FormControl>
                  {({ id, hasError }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger ref={field.ref} id={id} hasError={hasError}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </FormControl>
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
