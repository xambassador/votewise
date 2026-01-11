"use client";

import type { GetGroupJoinRequestsResponse } from "@votewise/client/group";

import { useFetchGroupJoinRequests } from "@/hooks/use-fetch-group-join-requests";
import { useJoinGroupRequestNotification } from "@/hooks/use-notifications";

import { Error } from "@votewise/ui/error";
import { Bell } from "@votewise/ui/icons/bell";

import { GroupJoinRequestNotification } from "@/components/notifications/group-join-request";

import Loading from "../notifications/loading";

type Props = {
  joinRequests: GetGroupJoinRequestsResponse;
};

export function GroupJoinRequestsList(props: Props) {
  const { joinRequests: initialData } = props;
  const { data, status, error } = useFetchGroupJoinRequests(initialData);
  useJoinGroupRequestNotification();

  switch (status) {
    case "pending":
      return <Loading />;
    case "error":
      return <Error error={error.message} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.requests.length === 0 && (
        <div className="content-height center">
          <div className="flex flex-col gap-3 items-center">
            <Bell className="size-10 text-black-200" />
            <h2 className="text-base text-gray-300">No new notifications</h2>
          </div>
        </div>
      )}

      {data.requests.map((req) => (
        <GroupJoinRequestNotification
          key={req.id}
          notification={{
            admin_id: "",
            group_id: req.group.id,
            group_name: req.group.name,
            avatar_url: req.user.avatar_url ?? "",
            user_id: req.user.id,
            user_name: req.user.username,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            invitation_id: req.id,
            notification_id: "",
            status: req.status,
            created_at: req.sent_at,
            event_type: "group_join_request"
          }}
        />
      ))}
    </div>
  );
}
