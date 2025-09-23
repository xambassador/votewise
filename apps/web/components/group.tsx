import type { Group as TGroup } from "@/types";

import Link from "next/link";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { truncate } from "@votewise/text/truncate";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Group,
  GroupAuthor,
  GroupAuthorHandle,
  GroupAuthorName,
  GroupCreatedAt,
  GroupDescription,
  GroupHeader,
  GroupMembers,
  GroupName,
  GroupStatusBadge,
  GroupType
} from "@votewise/ui/cards/group";
import { FloatingCounter } from "@votewise/ui/floating-counter";

import { routes } from "@/lib/routes";

extend(relativeTime);

type Props = { group: TGroup };

export function GroupMolecule(props: Props) {
  const { group } = props;
  const admin = group.admin;
  return (
    <Group>
      <GroupHeader>
        <GroupName asChild title={group.name}>
          <Link className="focus-visible" href={routes.group.view(group.id)}>
            {truncate(group.name, 80)}
          </Link>
        </GroupName>
        <GroupStatusBadge>{group.status}</GroupStatusBadge>
      </GroupHeader>
      <Link className="focus-visible" href={routes.group.view(group.id)}>
        <GroupDescription>{group.about}</GroupDescription>
      </Link>
      <div className="flex items-center justify-between">
        <GroupAuthor>
          <Link className="focus-visible" href={routes.user.profile(admin?.user_name || "")}>
            <Avatar>
              <AvatarFallback name={admin?.first_name + " " + admin?.last_name} />
              <AvatarImage
                src={admin?.avatar_url}
                alt={admin?.first_name + " " + admin?.last_name}
                className="overflow-clip-margin-unset object-cover"
              />
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link className="focus-visible" href={routes.user.profile(admin?.user_name || "")}>
              <GroupAuthorName title={admin?.first_name + " " + admin?.last_name}>
                {truncate(admin?.first_name + " " + admin?.last_name, 25)}
              </GroupAuthorName>
            </Link>
            <Link className="focus-visible" href={routes.user.profile(admin?.user_name || "")}>
              <GroupAuthorHandle title={admin?.user_name}>@{truncate(admin?.user_name || "", 30)}</GroupAuthorHandle>
            </Link>
          </div>
        </GroupAuthor>
        <GroupType>{group.type.toLowerCase()}</GroupType>
      </div>
      <div className="flex items-center justify-between">
        <GroupMembers>
          {group.members.map((member) => (
            <Avatar className="size-6" key={member.id}>
              <AvatarFallback name={member.first_name + " " + member.last_name} />
              <AvatarImage
                src={member.avatar_url}
                alt={member.first_name + " " + member.last_name}
                className="overflow-clip-margin-unset object-cover"
              />
            </Avatar>
          ))}
          {group.total_members - group.members.length > 0 && (
            <FloatingCounter className="size-7 text-xs -right-4">
              +{group.total_members - group.members.length}
            </FloatingCounter>
          )}
        </GroupMembers>
        <GroupCreatedAt>Created {dayjs(group.created_at).fromNow()}</GroupCreatedAt>
      </div>
    </Group>
  );
}
