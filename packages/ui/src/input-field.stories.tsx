import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";

import { Eye } from "./icons/eye";
import { EyeCross } from "./icons/eye-cross";
import { Padlock } from "./icons/padlock";
import { Input, InputField } from "./input-field";

const meta = {
  title: "ui/InputField",
  component: InputField,
  tags: ["input"],
  args: {
    hasError: false
  },
  render: (args) => <InputField {...args} />
} satisfies Meta<typeof InputField>;

export default meta;

type Story = StoryObj<typeof InputField>;

export const Default: Story = {};

export const WithInput: Story = {
  render: (args) => (
    <InputField {...args}>
      <Input placeholder="Type something cool..." />
    </InputField>
  )
};

export const WithErrorState: Story = {
  args: {
    hasError: true
  },
  render: (args) => (
    <InputField {...args}>
      <Input placeholder="This has an issue" />
    </InputField>
  )
};

export const Composition: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [showPassword, setShowPassword] = useState(false);
    return (
      <InputField className="w-[350px]" {...args}>
        <Padlock className="text-gray-600" />
        <Input type={showPassword ? "text" : "password"} placeholder="Your super secret password..." />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeCross className="text-gray-600" /> : <Eye className="text-gray-600" />}
        </button>
      </InputField>
    );
  }
};
