import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "./cn";

type UserAvatarsSummaryProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  count?: number;
  avatars: { name: string; url: string; username?: string }[];
  avatarProps?: React.ComponentProps<typeof Avatar>;
};

export function MoreItemsWithSummary(props: UserAvatarsSummaryProps) {
  const { avatars, count, avatarProps, ...rest } = props;
  return (
    <button {...rest} className={cn("flex items-center gap-1 w-fit mx-auto focus-visible rounded", rest.className)}>
      <div className="flex -space-x-4">
        {avatars.map((item, index) => (
          <Avatar
            {...avatarProps}
            key={item.username ?? index}
            className={cn("bg-gray-500 size-6", avatarProps?.className)}
          >
            <AvatarFallback name={item.name} />
            <AvatarImage src={item.url} alt={item.name} />
          </Avatar>
        ))}
      </div>
      {count ? (
        <span className="text-xs text-gray-400">+{count} More</span>
      ) : (
        <span className="text-xs text-gray-400">+ More</span>
      )}
    </button>
  );
}
