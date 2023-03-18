import React from "react";

import * as NotificationC from ".";

// TODO: Make it dynamic
export function JoinGroupNotification() {
  return (
    <NotificationC.NotificationBody>
      <NotificationC.NotificationAvatar src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" />
      <NotificationC.NotificationContentWrapper>
        <NotificationC.NotificationHeader>
          <NotificationC.NotificationTitle>
            <span className="font-bold">Nensi</span> wants to join your group.
          </NotificationC.NotificationTitle>
          <NotificationC.NotificationTimeAgo>2 hours ago</NotificationC.NotificationTimeAgo>
        </NotificationC.NotificationHeader>
        <NotificationC.NotificationContent
          className="rounded-tr rounded-br bg-gray-100"
          action="Naomi's personal group"
        >
          <NotificationC.NotificationActionButtonsPanel>
            <NotificationC.NotificationPrimaryButton>Confirm</NotificationC.NotificationPrimaryButton>
            <NotificationC.NotificationSecondaryButton>Delete</NotificationC.NotificationSecondaryButton>
          </NotificationC.NotificationActionButtonsPanel>
        </NotificationC.NotificationContent>
      </NotificationC.NotificationContentWrapper>
    </NotificationC.NotificationBody>
  );
}
