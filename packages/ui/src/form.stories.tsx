import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Form, FormControl, FormField, FormLabel, FormMessage } from "./form";
import { Input, InputField } from "./input-field";

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
  render: (args) => (
    <Form {...args}>
      <form onSubmit={(e) => e.preventDefault()}>
        <FormField name="username">
          <FormLabel>Username</FormLabel>
          <FormControl>
            <InputField {...args.register("username")}>
              <Input placeholder="Enter username" />
            </InputField>
          </FormControl>
          <FormMessage />
        </FormField>

        <Button type="submit" className="mt-5">
          Submit
        </Button>
      </form>
    </Form>
  )
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof Form>;

export const Default: Story = {};
