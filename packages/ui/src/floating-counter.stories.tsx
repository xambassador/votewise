import type { Meta, StoryObj } from "@storybook/react";

import { FloatingCounter } from "./floating-counter";

const meta = {
  title: "ui/FloatingCounter",
  tags: ["autodocs"],
  component: FloatingCounter,
  args: { children: "100", variant: "center" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["topRight", "topLeft", "bottomRight", "bottomLeft", "leftCenter", "rightCenter", "center"]
    }
  },
  render: (args) => <FloatingCounter {...args} />
} satisfies Meta<typeof FloatingCounter>;

export default meta;

type Story = StoryObj<typeof FloatingCounter>;

export const Default: Story = {};
