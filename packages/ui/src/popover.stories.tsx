import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta = {
  title: "ui/Popover",
  tags: ["autodocs"],
  component: Popover,
  subcomponents: {
    PopoverContent: PopoverContent as ComponentType<unknown>,
    PopoverTrigger: PopoverTrigger as ComponentType<unknown>
  },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger className="text-gray-50">Click me</PopoverTrigger>
      <PopoverContent className="text-gray-50">Popover content</PopoverContent>
    </Popover>
  )
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {};
