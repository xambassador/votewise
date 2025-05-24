import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "./_story-helpers";
import { MoreItemsWithSummary } from "./more-items";

const data = [
  { name: "avatar1", url: getRandomImage().url, etag: "1" },
  { name: "avatar2", url: getRandomImage().url, etag: "2" }
];

const meta = {
  title: "ui/MoreItemsWithSummary",
  component: MoreItemsWithSummary,
  tags: ["autodocs"],
  args: {
    avatars: data,
    count: 2
  },
  render: (args) => <MoreItemsWithSummary {...args} />
} satisfies Meta<typeof MoreItemsWithSummary>;

export default meta;

type Story = StoryObj<typeof MoreItemsWithSummary>;

export const Default: Story = {};
