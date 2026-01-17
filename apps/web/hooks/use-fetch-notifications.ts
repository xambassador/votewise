"use client";

import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { useQuery } from "@tanstack/react-query";

import { notificationClient } from "@/lib/client";
import { getNotificationsKey } from "@/lib/constants";
import { assertResponse } from "@/lib/error";

type Props = { initialData?: GetAllNotificationsResponse };

export function useFetchNotifications(props?: Props) {
  const query = useQuery({
    queryKey: getNotificationsKey(),
    queryFn: async () => assertResponse(await notificationClient.getAll()),
    initialData: props?.initialData
  });
  return query;
}
