import type { Meta, StoryObj } from "@storybook/react";

import { images } from "./_story-helpers";
import { BackgroundList } from "./background-list";

const meta = {
  title: "ui/BackgroundList",
  component: BackgroundList,
  args: {},
  render: (args) => <BackgroundList {...args} backgroundList={images} />
} satisfies Meta<typeof BackgroundList>;

export default meta;

type Story = StoryObj<typeof BackgroundList>;

export const Default: Story = {};
