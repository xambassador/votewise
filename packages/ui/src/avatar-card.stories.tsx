import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "./_story-helpers";
import { AvatarBackCards, AvatarCard, AvatarClearButton } from "./avatar-card";

const meta = {
  title: "ui/AvatarCard",
  component: AvatarCard,
  tags: ["autodocs", "avatar"],
  args: { url: getRandomImage().url },
  argTypes: {
    figureProps: { table: { disable: true } }
  },
  render: (args) => <AvatarCard {...args} />
} satisfies Meta<typeof AvatarCard>;

export default meta;

type Story = StoryObj<typeof AvatarCard>;

export const Default: Story = {};

export const WithBackCards: Story = {
  args: { url: getRandomImage().url },
  render: (args) => (
    <AvatarCard {...args}>
      <AvatarBackCards />
    </AvatarCard>
  )
};

export const WithClearButton: Story = {
  args: { url: getRandomImage().url },
  render: (args) => (
    <AvatarCard {...args}>
      <AvatarBackCards />
      <AvatarClearButton />
    </AvatarCard>
  )
};
