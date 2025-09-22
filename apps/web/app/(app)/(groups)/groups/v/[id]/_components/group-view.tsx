"use client";

import type { GetGroupResponse } from "@votewise/client/group";

import { useFetchGroup } from "@/hooks/use-fetch-group";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Badge } from "@votewise/ui/badge";
import { Error } from "@votewise/ui/error";
import { Clock } from "@votewise/ui/icons/clock";
import { Comment } from "@votewise/ui/icons/comment";
import { Heart } from "@votewise/ui/icons/heart";
import { Pencil } from "@votewise/ui/icons/pencil";
import { User } from "@votewise/ui/icons/user";
import { Image } from "@votewise/ui/image";

import Loading from "../loading";
import { JoinGroupBtn } from "./join-group-btn";
import { MembersSheet } from "./members-sheet";

extend(relativeTime);

type Props = { group: GetGroupResponse; id: string };

export function GroupView(props: Props) {
  const { group: initialData, id } = props;
  const { data, status, error } = useFetchGroup(id, { initialData });

  switch (status) {
    case "pending":
      return <Loading />;
    case "error":
      return <Error error={error.message} />;
  }

  const group = data;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <figure className="relative w-full h-[calc((200/16)*1rem)] max-h-[calc((200/16)*1rem)] rounded-xl overflow-hidden">
            <Image className="max-w-full size-full object-cover" src={group.cover_url ?? ""} alt={group.name} />
          </figure>
          <Avatar className="size-20 absolute -bottom-10 left-5">
            <AvatarImage
              src={group.logo_url ?? ""}
              alt={group.name}
              className="object-cover overflow-clip-margin-unset"
            />
            <AvatarFallback name={group.name} />
          </Avatar>
        </div>
        <div className="w-full flex items-center justify-end gap-2">
          <Badge>{group.type.toLowerCase()}</Badge>
          {group.is_invite_sent && <Badge variant="outline">Invite Sent</Badge>}
          {!group.self_is_member && !group.is_invite_sent && <JoinGroupBtn groupId={group.id} />}
        </div>
      </div>
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-gray-200">{group.name}</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="text-black-200 size-5" />
                <span className="text-sm text-black-200">Created {dayjs(group.created_at).fromNow()}</span>
              </div>
              <MembersSheet groupId={group.id} about={group.about} name={group.name} />
            </div>
          </div>
          <p className="text-sm text-gray-300">{group.about}</p>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-5">
            <div className="pb-3 border-b border-nobelBlack-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-5 text-black-200" />
                <span>
                  <b className="text-blue-300 text-lg">{group.aggregate.total_members}</b> members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative size-2">
                  <div className="rounded-full bg-green-500 animate-ping absolute inset-0" />
                  <div className="rounded-full bg-green-500 absolute inset-0" />
                </div>
                <span>
                  <b className="text-blue-300 text-lg">{group.aggregate.total_members}</b> online
                </span>
              </div>
            </div>

            <div className="pb-3 border-b border-nobelBlack-200 flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Pencil className="size-5 text-black-200" />
                <span>
                  <b className="text-blue-300 text-lg">{group.aggregate.total_posts}</b> posts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Comment className="size-5 text-black-200" />
                <span>
                  <b className="text-blue-300 text-lg">{group.aggregate.total_comments}</b> comments
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-black-200" />
                <span>
                  <b className="text-blue-300 text-lg">{group.aggregate.total_votes}</b> votes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
