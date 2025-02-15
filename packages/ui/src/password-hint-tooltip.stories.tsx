import type { Meta, StoryObj } from "@storybook/react";

import { PasswordHintTooltip } from "./password-hint-tooltip";

const meta = {
  title: "ui/PasswordHintTooltip",
  component: PasswordHintTooltip,
  tags: ["autodocs"],
  args: {
    password: ""
  },
  render: (args) => <PasswordHintTooltip {...args} />
} satisfies Meta<typeof PasswordHintTooltip>;

export default meta;

type Story = StoryObj<typeof PasswordHintTooltip>;

export const Default: Story = {};
