import type { Meta, StoryObj } from "@storybook/react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const meta = {
  title: "ui/Tooltip",
  tags: ["autodocs"],
  component: Tooltip,
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger className="text-gray-50">Hover me</TooltipTrigger>
      <TooltipContent className="bg-nobelBlack-200 border border-nobelBlack-100 rounded p-4 shadow-lg text-gray-50">
        Tooltip content
      </TooltipContent>
    </Tooltip>
  )
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};
