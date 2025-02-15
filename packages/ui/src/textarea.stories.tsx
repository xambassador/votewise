import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const meta = {
  title: "ui/Textarea",
  tags: ["autodocs"],
  component: Textarea,
  args: {
    placeholder: "Type here"
  },
  render: (args) => <Textarea {...args} />
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
