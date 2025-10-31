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
    return (
      <NotificationPremitives.Notification>
        <Link
          href={routes.user.profile(notification.content.username)}
          className="focus-presets focus-primary rounded-full"
        >
          <Avatar>
            <AvatarImage
              src={notification.content.avatar_url}
              alt={notification.content.first_name + " " + notification.content.last_name}
            />
            <AvatarFallback name={notification.content.first_name + " " + notification.content.last_name} />
          </Avatar>
        </Link>
        <NotificationPremitives.NotificationContent>
          <NotificationPremitives.NotificationHeader>
            <NotificationPremitives.NotificationMessage>
              <Link
                href={routes.user.profile(notification.content.username)}
                className="focus-presets focus-primary underline"
              >
                <NotificationPremitives.NotificationActor>
                  {notification.content.first_name} {notification.content.last_name}
                </NotificationPremitives.NotificationActor>{" "}
              </Link>
              requested to join{" "}
              <Link href={routes.group.view(notification.content.group_id)} className="focus-presets focus-primary">
                <NotificationPremitives.NotificationResource>
                  {notification.content.group_name}
                </NotificationPremitives.NotificationResource>
              </Link>
            </NotificationPremitives.NotificationMessage>

            <NotificationPremitives.NotificationTimeago>
              {dayjs(notification.created_at).fromNow()}
            </NotificationPremitives.NotificationTimeago>
          </NotificationPremitives.NotificationHeader>
          <NotificationPremitives.NotificationFooter>
            <AcceptJoinRequestButton
              requestId={notification.content.type === "GROUP_JOIN_REQUEST" ? notification.content.invitation_id : ""}
              groupId={notification.content.group_id}
              notificationId={notification.id}
            />
            <DeclineJoinRequestButton requestId={notification.id} groupId={notification.content.group_id} />
          </NotificationPremitives.NotificationFooter>
        </NotificationPremitives.NotificationContent>
      </NotificationPremitives.Notification>
    );
  },
  () => true
);
GroupJoinRequestNotification.displayName = "GroupJoinRequestNotification";
