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
  GroupCreatedBy,
  GroupDescription,
  GroupFooter,
  GroupHeader,
  GroupMembers,
  GroupName,
  GroupStatusBadge
} from "@votewise/ui/cards/group";

import { humanizeNumber } from "@/lib/humanize";
import { routes } from "@/lib/routes";

extend(relativeTime);

type Props = { group: TGroup };

export function GroupMolecule(props: Props) {
  const { group } = props;
  const viewGroupLabel = "View " + group.name.trim() + " group";
  return (
    <Group>
      <div className="flex items-start gap-4">
        <Link
          href={routes.group.view(group.id)}
          className="focus-visible rounded-xl"
          role="link"
          aria-label={viewGroupLabel}
        >
          <Avatar className="size-20 rounded-xl">
            <AvatarFallback name={group.name} className="rounded-none" />
            <AvatarImage src={group.logo_url ?? ""} alt={group.name} />
          </Avatar>
        </Link>
        <GroupContent>
          <GroupHeader>
            <GroupName asChild title={group.name}>
              <Link
                className="focus-visible hover:underline"
                href={routes.group.view(group.id)}
                role="link"
                aria-label={viewGroupLabel}
              >
                {truncate(group.name, 80)}
              </Link>
            </GroupName>
            <GroupCreatedAt>{dayjs(group.created_at).fromNow()}</GroupCreatedAt>
          </GroupHeader>
          <GroupDescription>{truncateOnWord(group.about, 120)}</GroupDescription>
          <GroupFooter>
            <GroupMembers total={humanizeNumber(group.total_members)} />
            <GroupStatusBadge>{group.type.toLowerCase()}</GroupStatusBadge>
          </GroupFooter>
          {group.admin && (
            <GroupCreatedBy>
              Created by{" "}
              <Link
                className="focus-visible font-semibold hover:underline"
                href={routes.user.profile(group.admin.user_name)}
                role="link"
                aria-label={`View ${group.admin.user_name} profile`}
              >
                {group.admin.user_name}
              </Link>
            </GroupCreatedBy>
          )}
        </GroupContent>
      </div>
    </Group>
  );
}
