"use client";

import { cn } from "./cn";
import { Image as ImageIcon } from "./icons/image";
import { getSrcSet } from "./image-utils";
import { Spinner } from "./ring-spinner";
import { useImageLoadingStatus } from "./use-image-status";

export type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  containerProps?: React.HTMLProps<HTMLDivElement>;
  errorElement?: React.ReactNode;
  loadingElement?: React.ReactNode;
};

export function Image(props: ImageProps) {
  const { src, children, alt, containerProps, errorElement, loadingElement, width, sizes, ...rest } = props;
  const imageLoadingStatus = useImageLoadingStatus(src, Number(width), sizes);
  const error = imageLoadingStatus === "error";
  const isLoading = imageLoadingStatus === "loading";
  const isLoaded = imageLoadingStatus === "loaded";

  const defaultErrorElement = (
    <div className="size-full flex items-center justify-center">
      <ImageIcon className="size-12 text-black-300" />
    </div>
  );

  const defaultLoadingElement = (
    <div className="size-full flex items-center justify-center">
      <Spinner className="size-5" />
    </div>
  );

  const srcSets = getSrcSet(src || "", { width: Number(width), sizes });

  return (
    <div {...containerProps} className={cn("size-full bg-nobelBlack-200", containerProps?.className)}>
      {error && (errorElement ? errorElement : defaultErrorElement)}
      {isLoading && (loadingElement ? loadingElement : defaultLoadingElement)}
      {isLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...rest} sizes={srcSets.sizes} srcSet={srcSets.srcSet} src={srcSets.url} alt={alt || "Avatar"} />
      )}
    </div>
  );
}
