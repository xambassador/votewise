import type { Meta, StoryObj } from "@storybook/react";

import { ImagePicker, ImagePickerButton, ImagePreview, ResetPreviewButton } from "./image-picker";

const meta = {
  title: "ui/ImagePicker",
  tags: ["autodocs"],
  component: ImagePicker,
  subcomponents: {
    ImagePickerButton,
    ImagePreview,
    ResetPreviewButton
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
  args: {
    url: "https://i.chzbgr.com/full/9112752128/h94C6655E/cute-cat-looking-at-the-camera-with-its-ears-hiding"
  },
  render: (args) => (
    <ImagePicker {...args}>
      <ImagePreview />
      <ImagePickerButton />
    </ImagePicker>
  )
};

export const WithInitialLoading: Story = {
  args: {
    url: "https://i.chzbgr.com/full/9112752128/h94C6655E/cute-cat-looking-at-the-camera-with-its-ears-hiding",
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
    url: "https://i.chzbgr.com/full/9112752128/h94C6655E/cute-cat-looking-at-the-camera-with-its-ears-hiding"
  },
  render: (args) => (
    <ImagePicker {...args}>
      <ImagePreview />
      <ImagePickerButton />
      <ResetPreviewButton />
    </ImagePicker>
  )
};
