import React from "react";

import * as NotificationC from ".";

// TODO: Make it dynamic
export function UpvotePostNotification() {
  return (
    <NotificationC.NotificationBody>
      <NotificationC.NotificationAvatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" />
      <NotificationC.NotificationContentWrapper>
        <NotificationC.NotificationHeader>
          <NotificationC.NotificationTitle>
            <span className="font-bold">Naomi</span> upvote your post.
          </NotificationC.NotificationTitle>
          <NotificationC.NotificationTimeAgo>2 hours ago</NotificationC.NotificationTimeAgo>
        </NotificationC.NotificationHeader>
        <NotificationC.NotificationContent action="This is Naoimi’s Cool Idea to save environment" />
      </NotificationC.NotificationContentWrapper>
    </NotificationC.NotificationBody>
  );
}
