import { AvatarCard } from "../avatar-card";
import { cn } from "../cn";
import { FloatingCounter } from "../floating-counter";

export type FeedProps = React.HTMLAttributes<HTMLDivElement>;
export function Feed(props: FeedProps) {
  return (
    <div
      {...props}
      className={cn(
        "p-4 rounded-xl bg-nobelBlack-100 border border-nobelBlack-200 flex items-stretch gap-6 max-w-[calc((600/16)*1rem)] min-h-[calc((200/16)*1rem)] max-h-[calc((400/16)*1rem)]",
        props.className
      )}
    />
  );
}

export type FeedContainerProps = React.HTMLAttributes<HTMLDivElement>;
export function FeedContainer(props: FeedContainerProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={cn("flex flex-col gap-6", className)}>
      {children}
    </div>
  );
}

export type FeedContentProps = React.HTMLAttributes<HTMLDivElement>;
export function FeedContent(props: FeedContentProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={cn("flex flex-col gap-1", className)}>
      {children}
    </div>
  );
}

export type FeedHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export function FeedHeader(props: FeedHeaderProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}

export type FeedUserNameProps = React.HTMLAttributes<HTMLSpanElement>;
export function FeedUserName(props: FeedUserNameProps) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cn("font-medium text-lg text-gray-300", className)}>
      {children}
    </span>
  );
}

export type FeedUserHandleProps = React.HTMLAttributes<HTMLSpanElement>;
export function FeedUserHandle(props: FeedUserHandleProps) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cn("text-gray-400 text-sm", className)}>
      {children}
    </span>
  );
}

export type FeedTimeAgoProps = React.HTMLAttributes<HTMLSpanElement>;
export function FeedTimeAgo(props: FeedTimeAgoProps) {
  const { children, className, ...rest } = props;
  return (
    <span {...rest} className={cn("text-gray-400 text-xs", className)}>
      {children}
    </span>
  );
}

export type FeedContentTextProps = React.HTMLAttributes<HTMLParagraphElement>;
export function FeedContentText(props: FeedContentTextProps) {
  const { children, className, ...rest } = props;
  return (
    <p {...rest} className={cn("text-base text-gray-300 font-normal", className)}>
      {children}
    </p>
  );
}

export type FeedContentTagsProps = React.HTMLAttributes<HTMLParagraphElement>;
export function FeedContentTags(props: FeedContentTagsProps) {
  const { children, className, ...rest } = props;
  return (
    <p {...rest} className={cn("text-blue-500 text-base flex flex-wrap gap-1", className)}>
      {children}
    </p>
  );
}

export type FeedFooterProps = React.HTMLAttributes<HTMLDivElement>;
export function FeedFooter(props: FeedFooterProps) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center gap-5", className)}>
      {children}
    </div>
  );
}

export function FeedFooterItem(props: React.HTMLAttributes<HTMLDivElement>) {
  const { children, className, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center gap-1", className)}>
      {children}
    </div>
  );
}

export function FeedImages(props: React.HTMLAttributes<HTMLDivElement> & { images: string[] }) {
  const { children, className, images, ...rest } = props;
  const length = images.length;
  const imagesToShow = length <= 3 ? images : images.slice(0, 3);
  const remainingImages = length - imagesToShow.length;
  return (
    <div {...rest} className={cn("flex -space-x-11 relative w-fit", className)}>
      {imagesToShow.map((image, index) => (
        <AvatarCard
          key={image}
          url={image}
          className={cn(index % 2 === 0 ? "rotate-[-6deg]" : "rotate-[5deg]")}
          figureProps={{ className: "group-hover:bg-nobelBlack-100" }}
        />
      ))}

      {remainingImages > 0 && (
        <FloatingCounter className="top-1/2 -right-5 -translate-y-1/2">{remainingImages}</FloatingCounter>
      )}
    </div>
  );
}
