"use client";

import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { useFetchNotifications } from "@/hooks/use-fetch-notifications";
import {
  useGroupInviteNotification,
  useGroupJoinNotification,
  useJoinGroupRequestNotification
} from "@/hooks/use-notifications";

import { Error } from "@votewise/ui/error";
import { Bell } from "@votewise/ui/icons/bell";

import { GroupJoinRequestNotification } from "@/components/notifications/group-join-request";
import { GroupJoinedNotification } from "@/components/notifications/group-joined";

import Loading from "../loading";

type Props = {
  notifications: GetAllNotificationsResponse;
};

export function NotificationList(props: Props) {
  const { notifications: initialData } = props;
  const { data, status, error } = useFetchNotifications({ initialData });
  useJoinGroupRequestNotification();
  useGroupJoinNotification();
  useGroupInviteNotification();

  switch (status) {
    case "pending":
      return <Loading />;
    case "error":
      return <Error error={error.message} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.notifications.length === 0 && (
        <div className="content-height center">
          <div className="flex flex-col gap-3 items-center">
            <Bell className="size-10 text-black-200" />
            <h2 className="text-base text-gray-300">No new notifications</h2>
          </div>
        </div>
      )}

      {data.notifications.map((notification) => {
        if (notification.event_type === "group_join_request") {
          return <GroupJoinRequestNotification key={notification.notification_id} notification={notification} />;
        }

        if (notification.event_type === "group_joined") {
          return <GroupJoinedNotification key={notification.notification_id} notification={notification} />;
        }

        return null;
      })}
    </div>
  );
}
