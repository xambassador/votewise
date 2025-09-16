import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Image } from "@votewise/ui/image";

type Props = {
  coverImage: string;
  name: string;
  avatarUrl: string;
};

export function ProfileImage(props: Props) {
  const { coverImage, name, avatarUrl } = props;
  return (
    <div className="relative mb-10">
      <figure className="relative w-full h-[calc((200/16)*1rem)] max-h-[calc((200/16)*1rem)] rounded-xl overflow-hidden">
        <Image className="size-full object-cover" src={coverImage} alt={name} />
      </figure>
      <Avatar className="size-20 absolute -bottom-10 left-5">
        <AvatarImage src={avatarUrl} alt={name} className="object-cover overflow-clip-margin-unset" />
        <AvatarFallback name={name} />
      </Avatar>
    </div>
  );
}
