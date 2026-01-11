"use client";

import type { GetGroupJoinRequestsResponse } from "@votewise/client/group";
import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { groupClient } from "@/lib/client";
import { getGroupKey, getGroupNotificationsKey, getMembersKey, getNotificationsKey } from "@/lib/constants";

const notificationQueryKey = getNotificationsKey();
const groupNotificationsKey = getGroupNotificationsKey();

export function useGroupJoinRequestAction(action: "accept" | "reject") {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["accept-join-request"],
    mutationFn: async (props: { id: string; groupId: string; notificationId?: string }) => {
      if (action === "reject") {
        const res = await groupClient.rejectJoinRequest(props.id, { notification_id: props.notificationId });
        if (!res.success) {
          throw new Error(res.error);
        }
        return res.data;
      }

      const res = await groupClient.acceptJoinRequest(props.id);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: notificationQueryKey }),
        queryClient.cancelQueries({ queryKey: groupNotificationsKey })
      ]);
      const previousNotifications = queryClient.getQueryData<GetAllNotificationsResponse>(notificationQueryKey);
      const previousGroupNotifications = queryClient.getQueryData<GetGroupJoinRequestsResponse>(groupNotificationsKey);

      queryClient.setQueryData<GetAllNotificationsResponse>(notificationQueryKey, (old) => {
        if (!old) return old;
        return {
          notifications: old.notifications.map((n) => {
            if (n.event_type === "group_join_request") {
              return {
                ...n,
                status: action === "accept" ? "ACCEPTED" : "REJECTED"
              };
            }
            return n;
          })
        } as GetAllNotificationsResponse;
      });
      queryClient.setQueryData<GetGroupJoinRequestsResponse>(groupNotificationsKey, (old) => {
        if (!old) return old;
        return {
          requests: old.requests.map((r) => {
            if (r.id === variables.id) {
              return {
                ...r,
                status: action === "accept" ? "ACCEPTED" : "REJECTED"
              };
            }
            return r;
          })
        } as GetGroupJoinRequestsResponse;
      });

      return { previousNotifications, previousGroupNotifications };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(notificationQueryKey, context?.previousNotifications);
      queryClient.setQueryData(groupNotificationsKey, context?.previousGroupNotifications);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: getGroupKey(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: getMembersKey(variables.groupId) });
    }
  });
  return mutation;
}
