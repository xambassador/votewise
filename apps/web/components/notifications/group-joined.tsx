import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { memo } from "react";
import Link from "next/link";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as NotificationPremitives from "@votewise/ui/cards/notification";

import { routes } from "@/lib/routes";

extend(relativeTime);

type Props = {
  notification: GetAllNotificationsResponse["notifications"][0];
};

export const GroupJoinedNotification = memo(
  (props: Props) => {
    const { notification } = props;
    return (
      <NotificationPremitives.Notification className="items-center">
        <Link href={routes.user.profile(notification.user_name)} className="focus-presets focus-primary rounded-full">
          <Avatar>
            <AvatarImage src={notification.avatar_url} alt={notification.first_name + " " + notification.last_name} />
            <AvatarFallback name={notification.first_name + " " + notification.last_name} />
          </Avatar>
        </Link>
        <NotificationPremitives.NotificationContent>
          <NotificationPremitives.NotificationHeader>
            <NotificationPremitives.NotificationMessage>
              <Link href={routes.user.profile(notification.user_name)} className="focus-presets focus-primary">
                <NotificationPremitives.NotificationActor>
                  {notification.first_name} {notification.last_name}
                </NotificationPremitives.NotificationActor>{" "}
              </Link>
              joined{" "}
              <Link href={routes.group.view(notification.group_id)} className="focus-presets focus-primary">
                <NotificationPremitives.NotificationResource>
                  {notification.group_name}!
                </NotificationPremitives.NotificationResource>
              </Link>
            </NotificationPremitives.NotificationMessage>

            <NotificationPremitives.NotificationTimeago>
              {dayjs(notification.created_at).fromNow()}
            </NotificationPremitives.NotificationTimeago>
          </NotificationPremitives.NotificationHeader>
        </NotificationPremitives.NotificationContent>
      </NotificationPremitives.Notification>
    );
  },
  () => true
);
GroupJoinedNotification.displayName = "GroupJoinedNotification";
