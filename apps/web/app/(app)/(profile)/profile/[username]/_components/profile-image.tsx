import { Avatar, AvatarFallback, AvatarImage } from "@votewise/ui/avatar";
import { Image } from "@votewise/ui/image";

type Props = {
  name: string;
  avatarUrl: string;
  coverImage: string;
};

export function ProfileImage(props: Props) {
  const { avatarUrl, coverImage, name } = props;
  return (
    <div className="relative mb-10">
      <figure className="relative w-full h-[calc((200/16)*1rem)] max-h-[calc((200/16)*1rem)] rounded-xl overflow-hidden">
        <Image className="size-full object-cover" src={coverImage} alt={name} />
      </figure>
      <Avatar className="size-20 absolute -bottom-10 left-5">
        <AvatarImage src={avatarUrl} alt={name} sizes="80px" />
        <AvatarFallback name={name} />
      </Avatar>
    </div>
  );
}
