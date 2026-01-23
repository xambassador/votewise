"use client";

import type { GetMeResponse } from "@votewise/client/user";

import { useFetchMe } from "@/hooks/use-fetch-me";

import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Image } from "@votewise/ui/image";

import { UpdateProfile } from "@/components/dialogs/update-profile";
import { useMe } from "@/components/user-provider";

type Props = { profile: GetMeResponse };

export function ProfileImage(props: Props) {
  const { profile: initialData } = props;
  const { data, error } = useFetchMe({ initialData });
  const { id } = useMe("ProfileImage");

  if (error) throw error;
  if (!data) return null;

  const canEdit = id === data.id;
  const editBtn = canEdit ? (
    <div className="w-full flex justify-end absolute -bottom-10 right-0">
      <UpdateProfile
        size="sm"
        profile={{
          avatarUrl: data.avatar_url,
          coverImageUrl: data.cover_image_url,
          firstName: data.first_name,
          lastName: data.last_name,
          about: data.about ?? "",
          id: data.id
        }}
      >
        Edit Profile
      </UpdateProfile>
    </div>
  ) : null;

  const name = data.first_name + " " + data.last_name;

  return (
    <div className="relative mb-10">
      <figure className="relative w-full h-[calc((200/16)*1rem)] max-h-[calc((200/16)*1rem)] rounded-xl overflow-hidden">
        <Image
          className="size-full object-cover overflow-clip-margin-unset"
          src={data.cover_image_url}
          alt={name}
          width={600}
        />
      </figure>
      <Avatar className="size-20 absolute -bottom-10 left-5">
        <AvatarImage src={data.avatar_url} alt={name} sizes="80px" />
        <AvatarFallback name={name} />
      </Avatar>
      {editBtn}
    </div>
  );
}
