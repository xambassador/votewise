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
              id: data.notificationId,
              event_type: "GROUP_JOIN_REQUEST",
              created_at: data.createdAt,
              content: {
                type: "GROUP_JOIN_REQUEST",
                avatar_url: data.avatarUrl,
                first_name: data.firstName,
                group_id: data.groupId,
                group_name: data.groupName,
                invitation_id: data.invitationId,
                last_name: data.lastName,
                user_id: data.userId,
                username: data.userName
              }
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
              created_at: new Date().toISOString(),
              group: {
                id: data.groupId,
                name: data.groupName
              },
              id: data.invitationId,
              sent_at: data.createdAt,
              user: {
                id: data.userId,
                first_name: data.firstName,
                last_name: data.lastName,
                username: data.userName,
                avatar_url: data.avatarUrl ?? null
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
                id: notificationCounter++,
                event_type: "GROUP_JOINED",
                created_at: data.createdAt,
                content: {
                  type: "GROUP_JOINED",
                  group_id: data.groupId,
                  avatar_url: data.avatarUrl,
                  first_name: data.firstName,
                  last_name: data.lastName,
                  group_name: data.groupName,
                  username: data.userName
                }
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
                created_at: data.createdAt,
                content: {
                  type: "GROUP_INVITATION",
                  group_id: data.groupId,
                  avatar_url: data.avatarUrl,
                  first_name: data.firstName,
                  last_name: data.lastName,
                  group_name: data.groupName,
                  username: data.userName,
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
