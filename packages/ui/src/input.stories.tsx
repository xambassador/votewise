import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta = {
  title: "ui/Input",
  component: Input,
  tags: ["autodocs", "input"],
  args: {
    placeholder: "Enter your name"
  },
  render: (args) => <Input {...args} />
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
