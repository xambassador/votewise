"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@votewise/ui/button";
import { Form, FormControl, FormField, FormLabel, FormMessage, useForm } from "@votewise/ui/form";
import { Input, InputField } from "@votewise/ui/input-field";

const schema = z.object({
  location: z.string({ required_error: "This field is required" }).min(1, { message: "This field is required" }),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional()
});

type Schema = z.infer<typeof schema>;

export function SocialsForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(schema)
  });

  function onSubmit() {}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <FormField name="location">
            <FormLabel>Location</FormLabel>
            <FormControl>
              <InputField>
                <Input type="text" placeholder="Where you leave John" {...form.register("location")} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="facebook">
            <FormLabel>Facebook</FormLabel>
            <FormControl>
              <InputField>
                <Input type="text" placeholder="Your facebook profile" {...form.register("facebook")} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="instagram">
            <FormLabel>Instagram</FormLabel>
            <FormControl>
              <InputField>
                <Input type="text" placeholder="Your instagram profile" {...form.register("instagram")} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="instagram">
            <FormLabel>Twitter</FormLabel>
            <FormControl>
              <InputField>
                <Input type="text" placeholder="Your twitter profile" {...form.register("twitter")} />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormField>
        </div>
        <div className="flex flex-col gap-5">
          <Button>Next</Button>
          <Button variant="secondary">Back</Button>
        </div>
      </form>
    </Form>
  );
}
