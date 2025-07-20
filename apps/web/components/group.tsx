import type { Group as TGroup } from "@/types";

import Link from "next/link";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { truncateOnWord } from "@votewise/text";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Group,
  GroupActionButton,
  GroupAuthor,
  GroupAuthorHandle,
  GroupAuthorName,
  GroupCreatedAt,
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
  const author = group.members.find((m) => m.role === "ADMIN");
  return (
    <Group>
      <GroupHeader>
        <GroupName title={group.name}>{truncateOnWord(group.name, 20)}</GroupName>
        <GroupStatusBadge>{group.status}</GroupStatusBadge>
      </GroupHeader>
      <div className="flex items-center justify-between">
        <GroupAuthor>
          <Link href={routes.user.profile(author?.id || "")}>
            <Avatar>
              <AvatarFallback name={author?.first_name + " " + author?.last_name} />
              <AvatarImage src={author?.avatar_url} alt={author?.first_name + " " + author?.last_name} />
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link href={routes.user.profile(author?.id || "")}>
              <GroupAuthorName title={author?.first_name + " " + author?.last_name}>
                {truncateOnWord(author?.first_name + " " + author?.last_name, 25)}
              </GroupAuthorName>
            </Link>
            <Link href={routes.user.profile(author?.id || "")}>
              <GroupAuthorHandle title={author?.user_name}>
                @{truncateOnWord(author?.user_name || "", 30)}
              </GroupAuthorHandle>
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
              <AvatarImage src={member.avatar_url} alt={member.first_name + " " + member.last_name} />
            </Avatar>
          ))}
          <FloatingCounter className="size-7 text-xs -right-4">
            +{group.total_members - group.members.length}
          </FloatingCounter>
        </GroupMembers>
        <GroupCreatedAt>Created {dayjs(group.created_at).fromNow()}</GroupCreatedAt>
      </div>
      <GroupActionButton>Join</GroupActionButton>
    </Group>
  );
}
