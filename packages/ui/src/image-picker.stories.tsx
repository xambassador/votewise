import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "./_story-helpers";
import { ImagePicker, ImagePickerButton, ImagePickerPill, ImagePreview, ResetPreviewButton } from "./image-picker";

const meta = {
  title: "ui/ImagePicker",
  tags: ["autodocs"],
  component: ImagePicker,
  subcomponents: {
    ImagePickerButton: ImagePickerButton as React.ComponentType<unknown>,
    ImagePreview: ImagePreview as React.ComponentType<unknown>,
    ResetPreviewButton: ResetPreviewButton as React.ComponentType<unknown>
  },
  args: {
    url: "",
    spinner: false
  },
  argTypes: {
    spinner: { control: "boolean" }
  },
  render: (args) => (
    <ImagePicker {...args}>
      <ImagePickerButton />
    </ImagePicker>
  )
} satisfies Meta<typeof ImagePicker>;

export default meta;

type Story = StoryObj<typeof ImagePicker>;

export const Default: Story = {};

export const WithPreview: Story = {
  args: { url: getRandomImage().url },
  render: (args) => (
    <ImagePicker {...args}>
      <ImagePreview />
      <ImagePickerButton />
    </ImagePicker>
  )
};

export const WithInitialLoading: Story = {
  args: {
    url: getRandomImage().url,
    spinner: true
  },
  render: (args) => (
    <ImagePicker {...args}>
      <ImagePreview />
      <ImagePickerButton />
    </ImagePicker>
  )
};

export const WithReset: Story = {
  args: {
    url: getRandomImage().url
  },
  render: (args) => (
    <ImagePicker {...args}>
      <ImagePreview />
      <ImagePickerButton />
      <ResetPreviewButton />
    </ImagePicker>
  )
};

type PillStory = StoryObj<typeof ImagePickerPill>;
export const Pill: PillStory = {
  render: (args) => <ImagePickerPill {...args} />
};

export const PillMultiple: PillStory = {
  render: (args) => <ImagePickerPill {...args} inputProps={{ multiple: true }} />
};
