import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "./cn";

type UserAvatarsSummaryProps = React.HTMLAttributes<HTMLDivElement> & {
  count: number;
  avatars: { name: string; url: string }[];
  avatarProps?: React.ComponentProps<typeof Avatar>;
};

export function MoreItemsWithSummary(props: UserAvatarsSummaryProps) {
  const { avatars, count, avatarProps, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center gap-1 w-fit mx-auto", rest.className)}>
      <div className="flex -space-x-4">
        {avatars.map((item) => (
          <Avatar {...avatarProps} key={item.url} className={cn("bg-gray-500 size-6", avatarProps?.className)}>
            <AvatarFallback name={item.name} />
            <AvatarImage src={item.url} alt={item.name} />
          </Avatar>
        ))}
      </div>
      <span className="text-xs text-gray-400">+{count} More</span>
    </div>
  );
}
