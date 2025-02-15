import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";

const meta = {
  title: "ui/Button",
  component: Button,
  tags: ["autodocs", "button"],
  args: {
    children: "Click me",
    variant: "primary",
    loading: false,
    disabled: false
  },
  argTypes: {
    variant: {
      options: ["primary", "secondary", "outline", "danger"],
      control: { type: "select" }
    },
    asChild: { table: { disable: true } },
    spinnerProps: { table: { disable: true } }
  },
  render: (args) => <Button {...args} />
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Loading: Story = {
  args: { loading: true }
};
