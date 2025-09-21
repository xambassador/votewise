"use client";

import { useGroupJoinRequestAction } from "@/hooks/use-join-request-action";

import { Button } from "@votewise/ui/button";

type Props = { requestId: string; groupId: string; notificationId?: string };

export function AcceptJoinRequestButton(props: Props) {
  const { requestId, groupId, notificationId } = props;
  const mutation = useGroupJoinRequestAction("accept");
  return (
    <Button
      size="sm"
      onClick={() => mutation.mutate({ id: requestId, groupId, notificationId })}
      loading={mutation.isPending}
    >
      Accept
    </Button>
  );
}

export function DeclineJoinRequestButton(props: Props) {
  const { requestId, groupId, notificationId } = props;
  const mutation = useGroupJoinRequestAction("reject");
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => mutation.mutate({ id: requestId, groupId, notificationId })}
      loading={mutation.isPending}
    >
      Decline
    </Button>
  );
}
