import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { memo } from "react";
import Link from "next/link";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import * as NotificationPremitives from "@votewise/ui/cards/notification";

import { routes } from "@/lib/routes";

import { AcceptJoinRequestButton, DeclineJoinRequestButton } from "../join-request-action-btns";

extend(relativeTime);

type Props = { notification: GetAllNotificationsResponse["notifications"][0] };

export const GroupJoinRequestNotification = memo(
  (props: Props) => {
    const { notification } = props;
    // just to get type safety
    if (notification.event_type !== "group_join_request") return null;
    return (
      <NotificationPremitives.Notification>
        <Link href={routes.user.profile(notification.user_name)} className="focus-presets focus-primary rounded-full">
          <Avatar>
            <AvatarImage src={notification.avatar_url} alt={notification.first_name + " " + notification.last_name} />
            <AvatarFallback name={notification.first_name + " " + notification.last_name} />
          </Avatar>
        </Link>
        <NotificationPremitives.NotificationContent>
          <NotificationPremitives.NotificationHeader>
            <NotificationPremitives.NotificationMessage>
              <Link
                href={routes.user.profile(notification.user_name)}
                className="focus-presets focus-primary underline"
              >
                <NotificationPremitives.NotificationActor>
                  {notification.first_name} {notification.last_name}
                </NotificationPremitives.NotificationActor>{" "}
              </Link>
              requested to join{" "}
              <Link href={routes.group.view(notification.group_id)} className="focus-presets focus-primary">
                <NotificationPremitives.NotificationResource>
                  {notification.group_name}
                </NotificationPremitives.NotificationResource>
              </Link>
            </NotificationPremitives.NotificationMessage>

            <NotificationPremitives.NotificationTimeago>
              {dayjs(notification.created_at).fromNow()}
            </NotificationPremitives.NotificationTimeago>
          </NotificationPremitives.NotificationHeader>
          {notification.status === "PENDING" && (
            <NotificationPremitives.NotificationFooter>
              <AcceptJoinRequestButton
                requestId={notification.invitation_id}
                groupId={notification.group_id}
                notificationId={notification.notification_id}
              />
              <DeclineJoinRequestButton requestId={notification.invitation_id} groupId={notification.group_id} />
            </NotificationPremitives.NotificationFooter>
          )}
          {notification.status !== "PENDING" && (
            <span className="text-sm font-medium text-black-200">
              {notification.status === "ACCEPTED" ? "Request Accepted" : "Request Declined"}
            </span>
          )}
        </NotificationPremitives.NotificationContent>
      </NotificationPremitives.Notification>
    );
  },
  (prev, next) => {
    if (
      prev.notification.event_type === "group_join_request" &&
      next.notification.event_type === "group_join_request"
    ) {
      return prev.notification.status === next.notification.status;
    }

    return true;
  }
);
GroupJoinRequestNotification.displayName = "GroupJoinRequestNotification";
