import type { Meta, StoryObj } from "@storybook/react";

import { PasswordInput } from "./password-input";

const meta = {
  title: "ui/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter your password",
    "data-has-error": false
  },
  render: (args) => <PasswordInput {...args} />
} satisfies Meta<typeof PasswordInput>;

export default meta;

type Story = StoryObj<typeof PasswordInput>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    ...Default.args,
    "data-has-error": true
  },
  render: (args) => <PasswordInput {...args} />
};
