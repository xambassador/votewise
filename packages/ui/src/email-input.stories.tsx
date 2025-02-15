import type { Meta, StoryObj } from "@storybook/react";

import { EmailInput } from "./email-input";

const meta = {
  title: "ui/EmailInput",
  tags: ["autodocs"],
  component: EmailInput,
  args: {
    placeholder: "Enter your email"
  },
  argTypes: {
    wrapperProps: { table: { disable: true } }
  },
  render: (args) => <EmailInput {...args} />
} satisfies Meta<typeof EmailInput>;

export default meta;

type Story = StoryObj<typeof EmailInput>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    "data-has-error": true
  }
};
