import type { Meta, StoryObj } from "@storybook/react";

import { VoteButton, VoteCount, VoteProvider } from "./vote-button";

const meta = {
  title: "ui/VoteButton",
  component: VoteProvider,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - Don't know why 😅
  subcomponents: { VoteButton, VoteCount },
  tags: ["autodocs"],
  args: {
    count: 0
  },
  render: (args) => (
    <VoteProvider {...args}>
      <VoteCount />
      <VoteButton>Vote</VoteButton>
    </VoteProvider>
  )
} satisfies Meta<typeof VoteProvider>;

export default meta;

type Story = StoryObj<typeof VoteProvider>;

export const Default: Story = {};
