import type { Meta, StoryObj } from "@storybook/react";

import { getRandomImage } from "../_story-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  Comment,
  CommentActions,
  CommentAuthor,
  CommentConnectorLine,
  CommentContent,
  CommentDate,
  CommentHeader,
  CommentInput,
  CommentList,
  CommentReplyButton,
  CommentReplyInput,
  Comments,
  CommentText,
  ReplyConnector,
  ReplyContainer
} from "./comment";

const meta = {
  title: "ui/Comments",
  component: Comments,
  tags: ["autodocs", "comments"],
  render: (args) => (
    <Comments {...args}>
      <CommentInput placeholder="Add a comment..." disableFocusIndicator />
      <CommentList>
        <Comment>
          <Avatar className="size-8">
            <AvatarFallback name="John doe" />
            <AvatarImage
              src={getRandomImage().url}
              alt={getRandomImage().name}
              className="overflow-clip-margin-unset"
            />
          </Avatar>
          <CommentContent>
            <CommentHeader>
              <CommentAuthor>John Doe</CommentAuthor>
              <CommentDate>2 hours ago</CommentDate>
            </CommentHeader>
            <CommentText>What about throwing a ball at the speed of light?</CommentText>
            <CommentActions>
              <CommentReplyButton />
            </CommentActions>
            <CommentReplyInput disableFocusIndicator />

            <ReplyContainer>
              <ReplyConnector />
              <Comment>
                <Avatar className="size-8">
                  <AvatarFallback name="John doe" />
                  <AvatarImage
                    src={getRandomImage().url}
                    alt={getRandomImage().name}
                    className="overflow-clip-margin-unset"
                  />
                </Avatar>
                <CommentContent>
                  <CommentHeader>
                    <CommentAuthor>John Doe</CommentAuthor>
                    <CommentDate>2 hours ago</CommentDate>
                  </CommentHeader>
                  <CommentText>What about throwing a ball at the speed of light?</CommentText>
                  <CommentActions>
                    <CommentReplyButton />
                  </CommentActions>
                  <CommentReplyInput disableFocusIndicator />
                </CommentContent>
                <CommentConnectorLine />
              </Comment>
            </ReplyContainer>
          </CommentContent>
          <CommentConnectorLine hasReplies />
        </Comment>
      </CommentList>
    </Comments>
  )
} satisfies Meta<typeof Comments>;

export default meta;

type Story = StoryObj<typeof Comments>;

export const Default: Story = {};
