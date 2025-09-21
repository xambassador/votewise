import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Button } from "../button";
import {
  Notification,
  NotificationActor,
  NotificationContent,
  NotificationFooter,
  NotificationHeader,
  NotificationMessage,
  NotificationResource,
  NotificationResourcePreview,
  NotificationResourcePreviewText,
  NotificationTimeago
} from "./notification";

const meta = {
  title: "ui/Notification",
  component: Notification,
  tags: ["autodocs", "notification"],
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Notification className="min-w-[600px] max-w-[600px]" {...args}>
        <Avatar>
          <AvatarFallback name="Amelia olla" />
          <AvatarImage src={getRandomImage().url} className="overflow-clip-margin-unset" />
        </Avatar>
        <NotificationContent>
          <NotificationHeader>
            <NotificationMessage>
              <NotificationActor>Amelia Olla</NotificationActor> wants to join{" "}
              <NotificationResource>Club GG</NotificationResource>.
            </NotificationMessage>
            <NotificationTimeago>24h ago</NotificationTimeago>
          </NotificationHeader>
          <NotificationFooter>
            <Button size="sm">Accept</Button>
            <Button size="sm" variant="secondary">
              Decline
            </Button>
          </NotificationFooter>
        </NotificationContent>
      </Notification>

      <Notification className="min-w-[600px] max-w-[600px]" {...args}>
        <Avatar>
          <AvatarFallback name="Amelia olla" />
          <AvatarImage src={getRandomImage().url} className="overflow-clip-margin-unset" />
        </Avatar>
        <NotificationContent>
          <NotificationHeader>
            <NotificationMessage>
              Your comment on <NotificationResource>How to travel in space without fuel</NotificationResource> was
              selected as the top comment!
            </NotificationMessage>
            <NotificationTimeago>24h ago</NotificationTimeago>
          </NotificationHeader>
          <NotificationResourcePreview>
            <NotificationResourcePreviewText>
              This is a comment that is being previewed. It might be a bit longer to show how it looks with more text.
            </NotificationResourcePreviewText>
          </NotificationResourcePreview>
        </NotificationContent>
      </Notification>
    </div>
  )
} satisfies Meta<typeof Notification>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
