import React from "react";

import { classNames } from "@votewise/lib";

import { Image } from "./Image";

type ImageProps = {
  className?: string;
  src: string;
  alt?: string;
  rounded?: boolean;
  withStroke?: boolean;
  width?: number;
  height?: number;
} & {
  imageProps?: React.ComponentProps<typeof Image>;
};

export function Avatar(props: ImageProps) {
  const { imageProps, className, src, alt, rounded, withStroke, width = 60, height = 60 } = props;

  const avatarClassName = classNames(
    "w-15 h-15 flex items-center overflow-hidden",
    rounded ? "rounded-full" : "rounded-lg",
    withStroke ? "p-1 bg-white" : "p-0",
    width ? `w-[calc((${width}/16)*1rem)]` : "",
    height ? `h-[calc((${width}/16)*1rem)]` : "",
    className
  );

  const imageClassName = classNames(rounded ? "rounded-full" : "rounded-lg", imageProps?.className);

  return (
    <div className={avatarClassName}>
      <Image src={src} alt={alt} width={width} height={height} {...imageProps} className={imageClassName} />
    </div>
  );
}

type StackImage = React.ComponentProps<typeof Image>;
export function AvatarStack(props: { avatars: StackImage[]; className?: string; showRemaining?: boolean }) {
  const { avatars, className: wrapperClasses, showRemaining = true } = props;
  const total = avatars.length;
  const imageWidth = avatars[0].width || 28;
  const imageHeight = avatars[0].height || 28;

  return (
    <div className={classNames("flex -space-x-1 overflow-hidden", wrapperClasses)}>
      {avatars.map((avatar, index) => {
        const { className, ...rest } = avatar;
        const imageClassName = classNames("inline-block rounded-full ring-2 ring-white", className);
        // eslint-disable-next-line react/no-array-index-key
        return <Image key={index} className={imageClassName} {...rest} />;
      })}

      {showRemaining && (
        <div
          className="z-50 flex flex-col items-center justify-center overflow-hidden rounded-full bg-blue-500 ring-2 ring-white"
          style={{ width: imageWidth, height: imageHeight }}
        >
          <span className="inline-block text-sm text-white">+{total}</span>
        </div>
      )}
    </div>
  );
}
