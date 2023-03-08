import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

// -----------------------------------------------------------------------------------------

interface ImageProps {
  src: string;
  height?: number;
  width?: number;
  alt?: string;
  effect?: "blur" | "opacity" | "black-and-white";
  className?: string;
}

export function Image({
  src,
  height = 40,
  width = 40,
  alt = "",
  effect = "blur",
  className = "",
}: ImageProps) {
  return (
    <LazyLoadImage
      className={className}
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
