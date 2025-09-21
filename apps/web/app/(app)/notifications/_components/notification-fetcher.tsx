import type { GetAllNotificationsResponse } from "@votewise/client/notification";

import { Error } from "@votewise/ui/error";

import { getNotificationClient } from "@/lib/client.server";

type Props = {
  children: (data: GetAllNotificationsResponse) => React.ReactNode;
};

export async function NotificationFetcher(props: Props) {
  const { children } = props;
  const client = getNotificationClient();
  const res = await client.getAll();
  if (!res.success) {
    return <Error error={res.error} />;
  }
  return <>{children(res.data)}</>;
}
