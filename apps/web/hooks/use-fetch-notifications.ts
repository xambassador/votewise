"use client";

import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { useQuery } from "@tanstack/react-query";

import { notificationClient } from "@/lib/client";
import { getNotificationsKey } from "@/lib/constants";

type Props = { initialData?: GetAllNotificationsResponse };

export function useFetchNotifications(props?: Props) {
  const query = useQuery({
    queryKey: getNotificationsKey(),
    queryFn: async () => {
      const res = await notificationClient.getAll();
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
    initialData: props?.initialData
  });
  return query;
}
