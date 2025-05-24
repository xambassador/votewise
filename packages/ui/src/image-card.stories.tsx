import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage, images } from "./_story-helpers";
import { ImageBackCards, ImageCard, ZigZagList } from "./image-card";

const meta = {
  title: "ui/ImageCard",
  component: ImageCard,
  tags: ["autodocs"],
  args: { url: getRandomImage().url },
  argTypes: {
    figureProps: { table: { disable: true } }
  },
  render: (args) => <ImageCard {...args} />
} satisfies Meta<typeof ImageCard>;

export default meta;

type Story = StoryObj<typeof ImageCard>;

export const Default: Story = {};

export const WithBackCards: Story = {
  args: { url: getRandomImage().url },
  render: (args) => (
    <ImageCard {...args}>
      <ImageBackCards />
    </ImageCard>
  )
};

type ZigZagStory = StoryObj<typeof ZigZagList>;
export const ZigZag: ZigZagStory = {
  args: { images },
  render: (args) => <ZigZagList {...args} />
};
