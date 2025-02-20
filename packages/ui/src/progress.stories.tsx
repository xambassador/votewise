import type { Meta, StoryObj } from "@storybook/react";

import { Progress, ProgressBar, ProgressTrack } from "./progress";

const meta = {
  title: "ui/Progress",
  component: Progress,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - Don't know how to fix this 😅
  subcomponents: { ProgressBar, ProgressTrack },
  tags: ["autodocs"],
  args: {
    progress: 30
  },
  render: (args) => (
    <Progress {...args}>
      <ProgressTrack />
      <ProgressBar />
    </Progress>
  )
} satisfies Meta<typeof Progress>;

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {};
