import type { ReactNode } from "react";
import React from "react";

import { classNames } from "@votewise/lib";
import { Avatar, Badge, Image, Input, Loader } from "@votewise/ui";
import { FiClock as Clock, FiSend, FiMapPin as MapPin } from "@votewise/ui/icons";

type PostMapPinIconProps = React.ComponentProps<typeof MapPin>;
export function PostMapPinIcon(props: PostMapPinIconProps) {
  const { className, ...rest } = props;
  return <MapPin className={className} {...rest} />;
}

type LocationProps = React.HtmlHTMLAttributes<HTMLDivElement>;
export function Location(props: LocationProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={classNames("flex items-center gap-1", className)} {...rest}>
      {children}
    </div>
  );
}

type PostTimeAgoClockIconProps = React.ComponentProps<typeof Clock>;
export function PostTimeAgoClockIcon(props: PostTimeAgoClockIconProps) {
  const { className, ...rest } = props;
  return <Clock className={className} {...rest} />;
}

type TimeAgoProps = React.HtmlHTMLAttributes<HTMLDivElement>;
export function TimeAgo(props: TimeAgoProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={classNames("flex items-center gap-1", className)} {...rest}>
      {children}
    </div>
  );
}

type PostTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
export function PostTitle(props: PostTitleProps) {
  const { className, children, ...rest } = props;
  return (
    <h1 className={classNames("text-2xl font-semibold text-gray-600", className)} {...rest}>
      {children}
    </h1>
  );
}

type PostTextProps = React.HTMLAttributes<HTMLParagraphElement>;
export function PostText(props: PostTextProps) {
  const { className, children, ...rest } = props;
  return (
    <p className={classNames("text-black-900 leading-6", className)} {...rest}>
      {children}
    </p>
  );
}

type PostHashTagsProps = React.HTMLAttributes<HTMLParagraphElement>;
export function PostHashTags(props: PostHashTagsProps) {
  const { className, children, ...rest } = props;
  return (
    <p className={classNames("text-blue-700", className)} {...rest}>
      {children}
    </p>
  );
}

type ButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;
export function ButtonGroup(props: ButtonGroupProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={classNames("flex items-center gap-2", className)} {...rest}>
      {children}
    </div>
  );
}

type PostHeaderProps = React.HTMLAttributes<HTMLHeadElement>;
export function PostHeader(props: PostHeaderProps) {
  const { className, children, ...rest } = props;
  return (
    <header className={classNames("flex justify-between", className)} {...rest}>
      {children}
    </header>
  );
}

type PostUserNameProps = React.HTMLAttributes<HTMLHeadingElement>;
export function PostUserName(props: PostUserNameProps) {
  const { className, children, ...rest } = props;
  return (
    <h3 className={classNames("text-black-900 text-xl font-semibold", className)} {...rest}>
      {children}
    </h3>
  );
}

type PostUserPillProps = {
  avatar: string;
  userName: string;
  location: string;
  timeAgo: string;
  children?: ReactNode;
} & {
  postHeaderProps?: React.ComponentProps<typeof PostHeader>;
  avatarProps?: React.ComponentProps<typeof Avatar>;
} & React.HTMLAttributes<HTMLDivElement>;
export function PostUserPill(props: PostUserPillProps) {
  const {
    avatar,
    userName,
    location,
    timeAgo,
    children,
    postHeaderProps,
    className,
    avatarProps,
    ...passThrough
  } = props;
  return (
    <PostHeader {...postHeaderProps}>
      <div className={classNames("flex", className)} {...passThrough}>
        <Avatar src={avatar} {...avatarProps} />
        <div className="ml-4 flex flex-col gap-1">
          <PostUserName>{userName}</PostUserName>
          <div className="flex gap-2 text-gray-600">
            <Location>
              <span>
                <PostMapPinIcon />
              </span>
              <span>{location}</span>
            </Location>
            <TimeAgo>
              <span>
                <PostTimeAgoClockIcon />
              </span>
              <span>{timeAgo}</span>
            </TimeAgo>
          </div>
        </div>
      </div>
      {children}
    </PostHeader>
  );
}

type PostFooterProps = React.HTMLAttributes<HTMLDivElement>;
export function PostFooter(props: PostFooterProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={classNames("flex items-center gap-7", className)} {...rest}>
      {children}
    </div>
  );
}

type PostProps = React.HTMLAttributes<HTMLDivElement>;
export function Post(props: PostProps) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={classNames(
        "flex min-w-[calc((774/16)*1rem)] max-w-[calc((774/16)*1rem)] flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type FigureProps = React.HTMLAttributes<HTMLElement>;
function Figure(props: FigureProps) {
  const { className, children, ...rest } = props;
  return (
    <figure className={classNames("h-fit", className)} {...rest}>
      {children}
    </figure>
  );
}

export function PostGallary({ images }: { images: { url: string }[] }) {
  if (!images.length) {
    return null;
  }

  return (
    <div className={classNames("grid grid-cols-2 gap-6", images.length === 1 && "grid-cols-1")}>
      {images.map((img) => (
        <Figure key={img.url} className={classNames(images.length > 1 && "h-full")}>
          <Image
            src={img.url}
            alt="Post"
            resetWidthAndHeight
            className="h-full w-full rounded-lg object-cover"
            wrapperClassName="w-full h-full"
          />
        </Figure>
      ))}
    </div>
  );
}

type PostStatuPillProps = React.ComponentProps<typeof Badge>;
export function PostStatuPill(props: PostStatuPillProps) {
  const { children, className, type = "primary" } = props;
  return (
    <Badge type={type} className={className}>
      {children}
    </Badge>
  );
}

type PostAddCommentInputProps = React.ComponentProps<typeof Input> & {
  formProps?: React.HTMLAttributes<HTMLFormElement>;
  isLoading: boolean;
};
export function PostAddCommentInput(props: PostAddCommentInputProps) {
  const { name = "comment", className, formProps, isLoading = false, ...rest } = props;
  return (
    <form
      className={classNames(
        "flex w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 pr-6 focus-within:ring-1 focus-within:ring-blue-600",
        formProps?.className
      )}
      {...formProps}
    >
      <Input
        name={name}
        type="text"
        className={classNames(
          "border-none bg-gray-50 py-3 placeholder:text-base placeholder:font-medium placeholder:text-gray-600 focus:ring-0",
          className
        )}
        {...rest}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading && <Loader className="h-5 w-5" loaderColor="#238BE6" />}
        {!isLoading && <FiSend className="h-5 w-5 text-gray-600" />}
      </button>
    </form>
  );
}
