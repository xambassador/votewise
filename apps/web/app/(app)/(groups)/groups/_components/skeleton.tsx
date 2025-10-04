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
import { Skeleton } from "@votewise/ui/skeleton";

export function GroupListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <GroupCardSkeleton key={index} />
      ))}
    </div>
  );
}

function GroupCardSkeleton() {
  return (
    <Group>
      <div className="flex gap-3">
        <Skeleton className="size-20 min-w-20 rounded-xl" />
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
            <GroupMembers>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton className="size-6 avatar-stack-skeleton" key={index} />
              ))}
            </GroupMembers>
            <Skeleton className="h-4 rounded-full">
              <GroupStatusBadge>Public</GroupStatusBadge>
            </Skeleton>
          </GroupFooter>
        </GroupContent>
      </div>
    </Group>
  );
}
