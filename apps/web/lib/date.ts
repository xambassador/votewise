import dayjs from "dayjs";
import plugin from "dayjs/plugin/relativeTime";

dayjs.extend(plugin);

export function timeAgo(date: Date) {
  return dayjs(date).fromNow();
}
