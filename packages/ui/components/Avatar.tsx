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
  imageProps?: {
    className?: string;
    effect?: "blur" | "opacity" | "black-and-white";
  };
};

export function Avatar(props: ImageProps) {
  const { imageProps, className, src, alt, rounded, withStroke, width = 60, height = 60 } = props;

  const avatarClassName = classNames(
    "w-15 h-15 flex items-center overflow-hidden",
    rounded ? "rounded-full" : "rounded-lg",
    withStroke ? "p-1" : "p-0",
    width ? `w-[calc((${width}/16)*1rem)]` : "",
    height ? `h-[calc((${width}/16)*1rem)]` : "",
    className
  );

  return (
    <div className={avatarClassName}>
      <Image src={src} alt={alt} width={width} height={height} {...imageProps} />
    </div>
  );
}
