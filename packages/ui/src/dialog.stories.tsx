import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import {
  Close,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./dialog";

const meta = {
  title: "ui/Dialog",
  component: Dialog,
  tags: ["autodocs", "dialog"],
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent className="p-12">
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <Close />
        </DialogHeader>
        <DialogDescription>This is a description</DialogDescription>
        <DialogFooter>Dialog footer</DialogFooter>
      </DialogContent>
    </Dialog>
  )
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {};
