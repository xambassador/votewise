import type { ReactNode } from "react";
import React from "react";

import { classNames } from "@votewise/lib";
import { Avatar, Image } from "@votewise/ui";
import { FiClock as Clock, FiMapPin as MapPin } from "@votewise/ui/icons";

export function PostMapPinIcon({ className = "" }) {
  return <MapPin className={className} />;
}

export function Location({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={classNames("flex items-center gap-1", className)}>{children}</div>;
}

export function PostTimeAgoClockIcon({ className = "" }) {
  return <Clock className={className} />;
}

export function TimeAgo({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={classNames("flex items-center gap-1", className)}>{children}</div>;
}

export function PostTitle({ className, children }: { className?: string; children?: ReactNode }) {
  return <h1 className={classNames("text-2xl font-semibold text-gray-600", className)}>{children}</h1>;
}

export function PostText({ className, children }: { className?: string; children?: ReactNode }) {
  return <p className={classNames("text-black-900 leading-6", className)}>{children}</p>;
}

export function PostHashTags({ className, children }: { className?: string; children?: ReactNode }) {
  return <p className={classNames("text-blue-700", className)}>{children}</p>;
}

export function ButtonGroup({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={classNames("flex items-center gap-2", className)}>{children}</div>;
}

export function PostHeader({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={classNames("flex", className)}>{children}</div>;
}

export function PostUserName({ className, children }: { className?: string; children?: ReactNode }) {
  return <h3 className={classNames("text-black-900 text-xl font-semibold", className)}>{children}</h3>;
}

export function PostUserPill({
  avatar,
  userName,
  location,
  timeAgo,
}: {
  avatar: string;
  userName: string;
  location: string;
  timeAgo: string;
}) {
  return (
    <PostHeader>
      <Avatar src={avatar} />
      <div className="ml-4 flex flex-col">
        <PostUserName>{userName}</PostUserName>
        <div className="mt-2 flex gap-2 text-gray-600">
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
    </PostHeader>
  );
}

export function PostFooter({ className, children }: { className?: string; children?: ReactNode }) {
  return <div className={classNames("flex items-center gap-7", className)}>{children}</div>;
}

export function Post({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={classNames(
        "flex max-w-[calc((774/16)*1rem)] flex-col gap-5 rounded-lg border border-gray-200 bg-white p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

function Figure({ children }: { children: ReactNode }) {
  return (
    <figure className="h-[calc((250/16)*1rem)] max-h-[calc((250/16)*1rem)] w-[calc((350/16)*1rem)]">
      {children}
    </figure>
  );
}

export function PostGallary({ images }: { images: { src: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {images.map((img) => (
        <Figure key={img.src}>
          <Image
            src={img.src}
            alt="Post"
            resetWidthAndHeight
            className="h-full w-full rounded-lg object-cover"
            wrapperClassName="max-h-[calc((250/16)*1rem)] w-full h-full"
          />
        </Figure>
      ))}
    </div>
  );
}
