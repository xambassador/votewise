import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Button } from "../button";
import { UserCheck } from "../icons/user-check";
import { UserCross } from "../icons/user-cross";
import * as Card from "./group-notification";

const meta = {
  title: "ui/Group Notification",
  component: Card.Notification,
  tags: ["autodocs"],
  render: (args) => (
    <Card.Notification {...args}>
      <Card.NotificationContent>
        <Avatar>
          <AvatarFallback />
          <AvatarImage src={getRandomImage().url} alt="User" className="overflow-clip-margin-unset" />
        </Avatar>
        <div className="flex flex-col gap-4">
          <Card.NotificationHeader>
            <Card.NotificationText>
              Nensi wants to join your <b className="text-blue-300 underline">Babu rao&apos;s pizza house</b> group.
            </Card.NotificationText>
            <Card.NotificationDate>2 hours ago</Card.NotificationDate>
          </Card.NotificationHeader>
          <Card.NotificationActions>
            <Button size="sm">
              <UserCheck />
            </Button>
            <Button size="sm" variant="danger">
              <UserCross />
            </Button>
          </Card.NotificationActions>
        </div>
      </Card.NotificationContent>
    </Card.Notification>
  )
} satisfies Meta<typeof Card.Notification>;

export default meta;

type Story = StoryObj<typeof Card.Notification>;

export const Default: Story = {};
