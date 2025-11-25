import { Skeleton } from "@votewise/ui/skeleton";

export function ProfileImageSkeleton() {
  return (
    <div className="relative mb-10 w-full h-[calc((200/16)*1rem)]">
      <div className="size-full h-[calc((200/16)*1rem)] rounded-xl bg-nobelBlack-200/80" />
      <Skeleton className="size-20 absolute -bottom-10 left-5 rounded-full" />
    </div>
  );
}

export function ProfileInfoSkeleton() {
  return (
    <div className="gap-4 flex flex-col pb-4 border-b border-nobelBlack-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-gray-200 mb-1">
            <Skeleton>John doe</Skeleton>
          </h1>
          <span className="text-base text-gray-400 font-medium">
            <Skeleton>@john_doe</Skeleton>
          </span>
        </div>
      </div>
      <p className="text-base text-gray-300">
        <Skeleton>Lorem ipsum dolor sit amet consectetur?</Skeleton>
      </p>
      <div>
        <div className="flex items-center gap-1 mb-1">
          <Skeleton className="size-6" />
          <span className="text-black-200 text-base">
            <Skeleton>Planet Earth</Skeleton>
          </span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <Skeleton className="size-6" />
          <span className="text-black-200 text-base">
            <Skeleton>Planet Earth</Skeleton>
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfileRelationStatsSkeleton() {
  return (
    <div className="flex items-center gap-5 pb-4 border-b border-nobelBlack-200">
      <div>
        <span className="text-lg font-semibold text-blue-300 block">
          <Skeleton>10</Skeleton>
        </span>
        <span className="block text-gray-400 text-sm">
          <Skeleton>Posts</Skeleton>
        </span>
      </div>
      <div>
        <span className="text-lg font-semibold text-blue-300 block">
          <Skeleton>10</Skeleton>
        </span>
        <span className="block text-gray-400 text-sm">
          <Skeleton>Followers</Skeleton>
        </span>
      </div>
      <div>
        <span className="text-lg font-semibold text-blue-300 block">
          <Skeleton>10</Skeleton>
        </span>
        <span className="block text-gray-400 text-sm">
          <Skeleton>Following</Skeleton>
        </span>
      </div>
    </div>
  );
}

export function ProfileActivityStatsSkeleton() {
  return (
    <div className="flex items-center gap-5 pb-4 border-b border-nobelBlack-200">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5" />
        <p className="text-sm text-gray-300">
          <Skeleton>comments</Skeleton>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-5" />
        <p className="text-sm text-gray-300">
          <Skeleton>comments</Skeleton>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-5" />
        <p className="text-sm text-gray-300">
          <Skeleton>comments</Skeleton>
        </p>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <ProfileImageSkeleton />
      <ProfileInfoSkeleton />
      <ProfileRelationStatsSkeleton />
      <ProfileActivityStatsSkeleton />
    </div>
  );
}
