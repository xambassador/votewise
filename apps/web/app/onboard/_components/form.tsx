"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@votewise/ui/button";
import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage } from "@votewise/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@votewise/ui/select";
import { Textarea } from "@votewise/ui/textarea";

const schema = z.object({
  gender: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  about: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" })
});

type Schema = z.infer<typeof schema>;

export function OnboardForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(schema)
  });

  const onSubmit = form.handleSubmit(() => {});

  return (
    <Form {...form}>
      <form className="flex flex-col gap-12" onSubmit={onSubmit}>
        <div className="flex flex-col gap-6">
          <FieldController
            name="gender"
            control={form.control}
            render={({ field }) => (
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
            )}
          />
          <FormField name="about">
            <FormLabel>About</FormLabel>
            <FormControl>
              <Textarea placeholder="About yourself..." {...form.register("about")} />
            </FormControl>
            <FormMessage />
          </FormField>
        </div>
        <Button type="submit">Next</Button>
      </form>
    </Form>
  );
}
