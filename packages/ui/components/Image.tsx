import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

interface ImageProps {
  src: string;
  height?: number;
  width?: number;
  alt?: string;
  effect?: "blur" | "opacity" | "black-and-white";
  className?: string;
  resetWidthAndHeight?: boolean;
  wrapperClassName?: string;
}

export function Image({
  src,
  height = 40,
  width = 40,
  alt = "",
  effect = "blur",
  className = "",
  resetWidthAndHeight = false,
  wrapperClassName = "",
}: ImageProps) {
  if (resetWidthAndHeight) {
    return (
      <LazyLoadImage
        className={className}
        wrapperClassName={wrapperClassName}
        src={src}
        alt={alt}
        effect={effect}
      />
    );
  }
  return (
    <LazyLoadImage
      className={className}
      wrapperClassName={wrapperClassName}
      src={src}
      alt={alt}
      height={height}
      width={width}
      effect={effect}
      style={{
        objectFit: "cover",
        maxWidth: "100%",
        height: "100%",
      }}
    />
  );
}
