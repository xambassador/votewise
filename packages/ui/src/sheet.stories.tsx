import type { Meta, StoryObj } from "@storybook/react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";

const meta = {
  title: "ui/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger className="focus-presets focus-primary rounded text-gray-200">Open</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your account and remove your data from our
            servers.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof Sheet>;

export const Default: Story = {};
