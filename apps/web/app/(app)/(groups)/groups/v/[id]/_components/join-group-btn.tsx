"use client";

import { useJoinGroup } from "@/hooks/use-join-group";

import { Button } from "@votewise/ui/button";

export function JoinGroupBtn(props: { groupId: string }) {
  const { mutate, isPending } = useJoinGroup(props.groupId);
  return (
    <Button size="sm" className="rounded-full text-xs" loading={isPending} onClick={() => mutate()}>
      Join
    </Button>
  );
}
