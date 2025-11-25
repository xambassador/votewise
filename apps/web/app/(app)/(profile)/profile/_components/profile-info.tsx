"use client";

import type { GetMeResponse } from "@votewise/client/user";

import { useFetchMe } from "@/hooks/use-fetch-me";
import dayjs, { extend } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { Error } from "@votewise/ui/error";
import { Clock } from "@votewise/ui/icons/clock";
import { LocationPin } from "@votewise/ui/icons/location-pin";

import { ProfileImageSkeleton, ProfileInfoSkeleton } from "./skeleton";

extend(relativeTime);

type Props = { profile: GetMeResponse };

export function ProfileInfo(props: Props) {
  const { profile: initialData } = props;
  const { data, error, status } = useFetchMe({ initialData });

  switch (status) {
    case "pending":
      return (
        <>
          <ProfileImageSkeleton />
          <ProfileInfoSkeleton />
        </>
      );
    case "error":
      return <Error error={error.message} />;
  }

  const name = data.first_name + " " + data.last_name;

  return (
    <div className="gap-4 flex flex-col pb-4 border-b border-nobelBlack-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl text-gray-200 font-semibold">{name}</h1>
          <span className="text-base text-gray-400">@{data.user_name}</span>
        </div>
      </div>
      <p className="text-base text-gray-300">{data.about}</p>
      <div>
        {data.location && (
          <div className="flex items-center gap-1 mb-1">
            <LocationPin className="text-black-200" />
            <span className="text-black-200 text-base">{data.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="text-black-200" />
          <span className="text-black-200 text-base">Joined {dayjs(data.joined_at).fromNow()}</span>
        </div>
      </div>
    </div>
  );
}
