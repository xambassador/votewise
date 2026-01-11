"use client";

import type { GetGroupJoinRequestsResponse } from "@votewise/client/group";
import type { GetAllNotificationsResponse } from "@votewise/client/notification";
import type { EventData } from "@votewise/types";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useRealtime } from "@/components/realtime";

import { getGroupNotificationsKey, getNotificationsKey } from "@/lib/constants";

const notificationsKey = getNotificationsKey();
const groupNotificationsKey = getGroupNotificationsKey();

let notificationCounter = 0;

export function useJoinGroupRequestNotification() {
  const { socket } = useRealtime("useJoinGroupRequestNotification");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    async function handler(data: EventData<"groupJoinRequestNotification">) {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationsKey }),
        queryClient.cancelQueries({ queryKey: groupNotificationsKey })
      ]);

      queryClient.setQueryData<GetAllNotificationsResponse>(notificationsKey, (old) => {
        if (!old) return old;
        return {
          notifications: [
            {
              ...data,
              id: data.notification_id,
              event_type: "group_join_request"
            },
            ...old.notifications
          ]
        } as GetAllNotificationsResponse;
      });

      queryClient.setQueryData<GetGroupJoinRequestsResponse>(groupNotificationsKey, (old) => {
        if (!old) return old;
        return {
          requests: [
            {
              id: data.invitation_id,
              sent_at: data.created_at,
              status: data.status,
              type: "JOIN",
              created_at: new Date().toISOString(),
              group: {
                id: data.group_id,
                name: data.group_name
              },
              user: {
                id: data.user_id,
                first_name: data.first_name,
                last_name: data.last_name,
                username: data.user_name,
                avatar_url: data.avatar_url ?? null
              }
            },
            ...old.requests
          ]
        } as GetGroupJoinRequestsResponse;
      });
    }

    socket.on("groupJoinRequestNotification", handler);
    // eslint-disable-next-line consistent-return
    return () => {
      socket.off("groupJoinRequestNotification", handler);
    };
  }, [queryClient, socket]);
}

export function useGroupJoinNotification() {
  const { socket } = useRealtime("useGroupJoinNotification");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    async function handler(data: EventData<"groupJoinNotification">) {
      await queryClient.cancelQueries({ queryKey: notificationsKey }),
        queryClient.setQueryData<GetAllNotificationsResponse>(notificationsKey, (old) => {
          if (!old) return old;
          return {
            notifications: [
              {
                ...data,
                id: notificationCounter++,
                event_type: "group_joined"
              },
              ...old.notifications
            ]
          } as GetAllNotificationsResponse;
        });
    }

    socket.on("groupJoinNotification", handler);
    // eslint-disable-next-line consistent-return
    return () => {
      socket.off("groupJoinNotification", handler);
    };
  }, [queryClient, socket]);
}

export function useGroupInviteNotification() {
  const { socket } = useRealtime("useGroupInviteNotification");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;
    async function handler(data: EventData<"groupInviteNotification">) {
      await queryClient.cancelQueries({ queryKey: notificationsKey }),
        queryClient.setQueryData<GetAllNotificationsResponse>(notificationsKey, (old) => {
          if (!old) return old;
          return {
            notifications: [
              {
                id: notificationCounter++,
                event_type: "GROUP_INVITATION",
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error @todo - Update once event is added
                created_at: data.createdAt,
                content: {
                  type: "GROUP_INVITATION",
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  group_id: data.groupId,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  avatar_url: data.avatarUrl,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  first_name: data.firstName,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  last_name: data.lastName,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  group_name: data.groupName,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  username: data.userName,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error @todo - Update once event is added
                  invitation_id: data.invitationId
                }
              },
              ...old.notifications
            ]
          } as GetAllNotificationsResponse;
        });
    }

    socket.on("groupInviteNotification", handler);
    // eslint-disable-next-line consistent-return
    return () => {
      socket.off("groupInviteNotification", handler);
    };
  }, [queryClient, socket]);
}
