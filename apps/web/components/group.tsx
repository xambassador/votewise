import type { Group as TGroup } from "@/types";

import Link from "next/link";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { truncateOnWord } from "@votewise/text";
import { truncate } from "@votewise/text/truncate";
import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import {
  Group,
  GroupContent,
  GroupCreatedAt,
  GroupDescription,
  GroupFooter,
  GroupHeader,
  GroupMembers,
  GroupName,
  GroupStatusBadge
} from "@votewise/ui/cards/group";
import { FloatingCounter } from "@votewise/ui/floating-counter";

import { routes } from "@/lib/routes";

extend(relativeTime);

type Props = { group: TGroup };

export function GroupMolecule(props: Props) {
  const { group } = props;
  return (
    <Group>
      <div className="flex gap-3">
        <Avatar className="size-20 rounded-xl">
          <AvatarFallback name={group.name} className="rounded-none" />
          <AvatarImage
            src={group.logo_url ?? ""}
            alt={group.name}
            className="overflow-clip-margin-unset object-cover"
          />
        </Avatar>
        <GroupContent>
          <GroupHeader>
            <GroupName asChild title={group.name}>
              <Link className="focus-visible" href={routes.group.view(group.id)}>
                {truncate(group.name, 80)}
              </Link>
            </GroupName>
            <GroupCreatedAt>{dayjs(group.created_at).fromNow()}</GroupCreatedAt>
          </GroupHeader>
          <GroupDescription>{truncateOnWord(group.about, 120)}</GroupDescription>
          <GroupFooter>
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
            <GroupStatusBadge>{group.type.toLowerCase()}</GroupStatusBadge>
          </GroupFooter>
        </GroupContent>
      </div>
    </Group>
  );
}
