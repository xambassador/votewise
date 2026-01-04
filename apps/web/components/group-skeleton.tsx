import { PAGINATION } from "@votewise/constant";
import {
  Group,
  GroupContent,
  GroupCreatedAt,
  GroupDescription,
  GroupFooter,
  GroupHeader,
  GroupName,
  GroupStatusBadge
} from "@votewise/ui/cards/group";
import { Skeleton } from "@votewise/ui/skeleton";

import { cn } from "@/lib/cn";

export function GroupListSkeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("flex flex-col gap-4", props.className)}>
      {Array.from({ length: PAGINATION.groups.limit }).map((_, index) => (
        <GroupCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function GroupCardSkeleton() {
  return (
    <Group>
      <div className="flex items-start gap-4">
        <Skeleton className="size-20 hidden sm:block min-w-20 rounded-xl" />
        <GroupContent>
          <GroupHeader>
            <GroupName>
              <Skeleton>John doe&apos; group</Skeleton>
            </GroupName>
            <GroupCreatedAt>
              <Skeleton>2 days ago</Skeleton>
            </GroupCreatedAt>
          </GroupHeader>
          <GroupDescription className="leading-7">
            <Skeleton>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati quo ut illo impedit eos ab animi
            </Skeleton>
          </GroupDescription>
          <GroupFooter>
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 rounded-full">
                <span>80</span>
              </Skeleton>
              <Skeleton className="h-4 rounded-full">
                <span>80</span>
              </Skeleton>
            </div>
            <Skeleton className="h-4 rounded-full">
              <GroupStatusBadge>Public</GroupStatusBadge>
            </Skeleton>
          </GroupFooter>
        </GroupContent>
      </div>
    </Group>
  );
}
