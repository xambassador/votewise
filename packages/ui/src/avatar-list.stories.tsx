import type { Meta, StoryObj } from "@storybook/react";

import { images } from "./_story-helpers";
import { AvatarList } from "./avatar-list";

const meta = {
  title: "ui/AvatarList",
  component: AvatarList,
  args: {
    // eslint-disable-next-line no-console
    onSelect: (avatar) => console.log(avatar)
  },
  render: (args) => <AvatarList {...args} avatarList={images} />
} satisfies Meta<typeof AvatarList>;

export default meta;

type Story = StoryObj<typeof AvatarList>;

export const Default: Story = {};
