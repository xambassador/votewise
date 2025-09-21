import { NotificationFetcher } from "./_components/notification-fetcher";
import { NotificationList } from "./_components/notification-list";

export default function Page() {
  return <NotificationFetcher>{(data) => <NotificationList notifications={data} />}</NotificationFetcher>;
}
