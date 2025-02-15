import type { Meta, StoryObj } from "@storybook/react";

import { PasswordStrength } from "./password-strength";

const meta = {
  title: "ui/Password Strength Indicator",
  component: PasswordStrength,
  tags: ["autodocs"],
  args: {
    password: ""
  },
  render: (args) => <PasswordStrength {...args} />
} satisfies Meta<typeof PasswordStrength>;

export default meta;

type Story = StoryObj<typeof PasswordStrength>;

export const Default: Story = {};
