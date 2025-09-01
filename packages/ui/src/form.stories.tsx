import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { FieldController, Form, FormControl, FormField, FormLabel, FormMessage, useForm } from "./form";
import { Input, InputField } from "./input-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const meta = {
  title: "ui/Form",
  component: Form,
  args: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - I don't want to pass all the useForm props
    formState: {
      defaultValues: {
        username: ""
      }
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    getFieldState: () => {},
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    register: () => {}
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm({
      defaultValues: {
        gender: ""
      }
    });
    return (
      <Form {...args}>
        <form onSubmit={(e) => e.preventDefault()} className="min-w-[400px]">
          <FormField name="username">
            <FormLabel>Username</FormLabel>
            <FormControl>
              <InputField {...args.register("username")}>
                <Input placeholder="Enter username" />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormField>

          <FieldController
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormField name="gender">
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

          <Button type="submit" className="mt-5">
            Submit
          </Button>
        </form>
      </Form>
    );
  }
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof Form>;

export const Default: Story = {};
