import React from "react";

import * as NotificationC from ".";

// TODO: Make it dynamic
export function FollowingNotification() {
  return (
    <NotificationC.NotificationBody>
      <NotificationC.NotificationAvatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" />
      <NotificationC.NotificationContentWrapper>
        <NotificationC.NotificationHeader>
          <NotificationC.NotificationTitle>
            <span className="font-bold">Naomi</span> started to following you.
          </NotificationC.NotificationTitle>
          <NotificationC.NotificationTimeAgo>2 hours ago</NotificationC.NotificationTimeAgo>
        </NotificationC.NotificationHeader>
        <NotificationC.NotificationContent>
          Add Nensi as your friend.
          <NotificationC.NotificationActionButtonsPanel>
            <NotificationC.NotificationPrimaryButton>Add Friend</NotificationC.NotificationPrimaryButton>
            <NotificationC.NotificationSecondaryButton>Discard</NotificationC.NotificationSecondaryButton>
          </NotificationC.NotificationActionButtonsPanel>
        </NotificationC.NotificationContent>
      </NotificationC.NotificationContentWrapper>
    </NotificationC.NotificationBody>
  );
}
