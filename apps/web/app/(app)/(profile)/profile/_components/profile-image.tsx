import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Image } from "@votewise/ui/image";

import { UpdateProfile } from "@/components/dialogs/update-profile";

type Props = {
  coverImage: string;
  name: string;
  avatarUrl: string;
  firstName: string;
  lastName: string;
  about: string;
};

export function ProfileImage(props: Props) {
  const { coverImage, name, avatarUrl, firstName, lastName, about } = props;
  return (
    <div className="relative mb-10">
      <figure className="relative w-full h-[calc((200/16)*1rem)] max-h-[calc((200/16)*1rem)] rounded-xl overflow-hidden">
        <Image className="size-full object-cover" src={coverImage} alt={name} />
      </figure>
      <Avatar className="size-20 absolute -bottom-10 left-5">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback name={name} />
      </Avatar>
      <div className="w-full flex justify-end absolute -bottom-10 right-0">
        <UpdateProfile
          size="sm"
          profile={{
            avatarUrl,
            coverImageUrl: coverImage,
            firstName,
            lastName,
            about
          }}
        >
          Edit Profile
        </UpdateProfile>
      </div>
    </div>
  );
}
