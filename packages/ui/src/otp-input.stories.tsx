import type { Meta, StoryObj } from "@storybook/react";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "./otp-input";

const meta = {
  title: "ui/OTP Input",
  component: InputOTP,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - Don't know why 😢
  subcomponents: { InputOTPSlot },
  tags: ["autodocs"],
  args: {
    maxLength: 6,
    onChange: () => {},
    disabled: false
  },
  render: (args) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error - Don't know why 😢
    <InputOTP {...args}>
      <InputOTPGroup>
        {Array.from({ length: 6 }).map((_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  )
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {};
