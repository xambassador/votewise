import type { Meta, StoryObj } from "@storybook/react";

import { AvatarBackCards, AvatarCard, AvatarClearButton } from "./avatar-card";

const meta = {
  title: "ui/AvatarCard",
  component: AvatarCard,
  tags: ["autodocs", "avatar"],
  args: {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s"
  },
  argTypes: {
    figureProps: { table: { disable: true } }
  },
  render: (args) => <AvatarCard {...args} />
} satisfies Meta<typeof AvatarCard>;

export default meta;

type Story = StoryObj<typeof AvatarCard>;

export const Default: Story = {};

export const WithBackCards: Story = {
  args: {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s"
  },
  render: (args) => (
    <AvatarCard {...args}>
      <AvatarBackCards />
    </AvatarCard>
  )
};

export const WithClearButton: Story = {
  args: {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjSKoyOjhKTNOkbuXv8zhtxMwtpt39UaMmLA&s"
  },
  render: (args) => (
    <AvatarCard {...args}>
      <AvatarBackCards />
      <AvatarClearButton />
    </AvatarCard>
  )
};
