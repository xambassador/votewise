import type { Meta, StoryObj } from "@storybook/react";

import { MoreItemsWithSummary } from "./more-items";

const data = [
  { name: "avatar1", url: "https://i.pinimg.com/736x/e3/24/f7/e324f790cfe0a51d76f98356475cc408.jpg", etag: "1" },
  { name: "avatar2", url: "https://i.pinimg.com/736x/39/6d/f5/396df568a4325fe46c4a4801e198e7ef.jpg", etag: "2" }
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
