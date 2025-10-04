import { Badge } from "@votewise/ui/badge";
import { Skeleton } from "@votewise/ui/skeleton";

export function GroupSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <div className="relative h-[calc((200/16)*1rem)]">
          <div className="rounded-xl size-full bg-nobelBlack-100" />
          <Skeleton className="size-20 absolute -bottom-10 left-5 rounded-full" />
        </div>
        <div className="w-full flex items-center justify-end gap-2">
          <Badge>
            <Skeleton className="h-4">public</Skeleton>
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-gray-200">
              <Skeleton>John doe&apos;s Group</Skeleton>
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Skeleton className="size-5" />
                <span className="text-sm text-black-200">
                  <Skeleton>Created 2 days ago</Skeleton>
                </span>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <p className="text-sm text-gray-300">
            <Skeleton className="leading-7">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Tempore, corrupti? Porro dolorum voluptate sit
              fugiat aliquam totam eaque vel doloremque.
            </Skeleton>
          </p>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-5">
            <div className="pb-3 border-b border-nobelBlack-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5" />
                <span>
                  <Skeleton>members</Skeleton>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  <Skeleton>online</Skeleton>
                </span>
              </div>
            </div>

            <div className="pb-3 border-b border-nobelBlack-200 flex items-center gap-5">
              <div className="flex items-center gap-2">
                <Skeleton className="size-5" />
                <span>
                  <Skeleton>posts</Skeleton>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-5" />
                <span>
                  <Skeleton>comments</Skeleton>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-5" />
                <span>
                  <Skeleton>votes</Skeleton>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
