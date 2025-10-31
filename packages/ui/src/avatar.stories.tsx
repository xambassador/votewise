import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "./_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta = {
  title: "ui/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  subcomponents: { AvatarFallback, AvatarImage },
  args: {},
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={getRandomImage().url} />
      <AvatarFallback name="John doe" />
    </Avatar>
  )
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://notfound.com" />
      <AvatarFallback name="John doe" />
    </Avatar>
  )
};
