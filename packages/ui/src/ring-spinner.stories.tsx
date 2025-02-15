import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from "./ring-spinner";

const meta = {
  title: "ui/Ring spinner",
  tags: ["autodocs", "spinner"],
  component: Spinner,
  args: {
    className: "text-white-50"
  },
  render: (args) => <Spinner {...args} />
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {};
