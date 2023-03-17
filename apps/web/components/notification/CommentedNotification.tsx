import React from "react";

import * as NotificationC from ".";

// TODO: Make it dynamic
export function CommentedNotification() {
  return (
    <NotificationC.NotificationBody>
      <NotificationC.NotificationAvatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" />
      <NotificationC.NotificationContentWrapper>
        <NotificationC.NotificationHeader>
          <NotificationC.NotificationTitle>
            <span className="font-bold">Naomi</span> commented on your post
          </NotificationC.NotificationTitle>
          <NotificationC.NotificationTimeAgo>2 hours ago</NotificationC.NotificationTimeAgo>
        </NotificationC.NotificationHeader>
        <NotificationC.NotificationContent
          className="rounded-tr rounded-br bg-gray-100"
          action="This is Naoimi’s Cool Idea to save environment"
        >
          This is looking great. Let&apos;s get started.
        </NotificationC.NotificationContent>
      </NotificationC.NotificationContentWrapper>
    </NotificationC.NotificationBody>
  );
}
