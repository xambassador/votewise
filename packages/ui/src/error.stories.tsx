import type { Meta, StoryObj } from "@storybook/react";

import { Error } from "./error";

const meta = {
  title: "ui/Error",
  tags: ["autodocs"],
  component: Error,
  args: {
    error: "Oops! Something went wrong.",
    errorInfo: {
      componentStack:
        "in ErrorBoundary (created by withErrorBoundary)\n    in withErrorBoundary (created by App)\n    in App"
    },
    resetErrorBoundary: () => {}
  },
  render: (args) => <Error {...args} />
} satisfies Meta<typeof Error>;

export default meta;

type Story = StoryObj<typeof Error>;

export const Default: Story = {};
