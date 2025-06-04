import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta = {
  title: "ui/Badge",
  component: Badge,
  tags: ["autodocs", "badge"],
  args: {
    children: "Badge",
    variant: "default"
  },
  argTypes: {
    variant: {
      options: ["default", "secondary", "destructive", "outline", "success"],
      control: { type: "select" }
    }
  },
  render: (args) => <Badge {...args} />
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" }
};

export const Destructive: Story = {
  args: { variant: "destructive" }
};

export const Outline: Story = {
  args: { variant: "outline" }
};
