"use client";

import type { VariantProps } from "class-variance-authority";

import { useRef, useState } from "react";
import { cva } from "class-variance-authority";

import { cn } from "./cn";
import { Cross } from "./icons/cross";
import { Image as ImageIcon } from "./icons/image";
import { Spinner } from "./ring-spinner";
import { useIsHydrated } from "./use-is-hydrated";
import { useLayoutEffect } from "./use-layout-effect";

type Props = React.HTMLProps<HTMLDivElement> & {
  url: string;
  figureProps?: React.ComponentProps<"figure">;
};

export function ImageCard(props: Props) {
  const { url, children, figureProps, alt, ...rest } = props;
  const imageLoadingStatus = useImageLoadingStatus(url);
  const error = imageLoadingStatus === "error";
  const isLoading = imageLoadingStatus === "loading";
  const isLoaded = imageLoadingStatus === "loaded";

  return (
    <div
      {...rest}
      className={cn(
        "relative max-w-[calc((200/16)*1rem)] flex items-center justify-center group cursor-pointer",
        rest.className
      )}
    >
      <figure
        {...figureProps}
        className={cn(
          "relative z-[3] w-[calc((100/16)*1rem)] h-[calc((140/16)*1rem)] bg-nobelBlack-200 rounded-2xl border border-black-400 shadow-image-card p-3 group-hover:translate-y-[-5px] transition-transform duration-300",
          error && "border-red-400",
          figureProps?.className
        )}
      >
        {error && (
          <div className="size-full flex items-center justify-center">
            <ImageIcon className="size-12 text-black-300" />
          </div>
        )}
        {isLoading && (
          <div className="size-full flex items-center justify-center">
            <Spinner className="size-5" />
          </div>
        )}
        {isLoaded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt || "Avatar"} className="size-full object-cover rounded-2xl" />
        )}
      </figure>
      {children}
    </div>
  );
}

export function ImageBackCards() {
  return (
    <>
      <div className="absolute z-[1] rotate-[15deg] top-[4px] left-[24px] w-[calc((100/16)*1rem)] h-[calc((140/16)*1rem)] bg-nobelBlack-100 rounded-2xl border border-black-400 shadow-image-card p-3 group-hover:rotate-[25deg] group-hover:translate-x-3 group-hover:border-blue-400 group-hover:bg-nobelBlack-50 transition-all duration-300" />
      <div className="absolute z-[1] rotate-[-15deg] top-[4px] right-[24px] w-[calc((100/16)*1rem)] h-[calc((140/16)*1rem)] bg-nobelBlack-100 rounded-2xl border border-black-400 shadow-image-card p-3 group-hover:rotate-[-25deg] group-hover:-translate-x-3 group-hover:border-blue-400 group-hover:bg-nobelBlack-50 transition-all duration-300" />
    </>
  );
}

const clearButtonVariants = cva(
  "absolute z-10 flex opacity-0 items-center justify-center p-1 rounded-full bg-nobelBlack-200 border border-black-400 group-hover:opacity-100 transition-[transform_,_opacity] duration-300 hover:scale-125 hover:rotate-180",
  {
    variants: {
      variant: {
        topLeft: "-top-1 -left-1",
        topRight: "-top-1 right-1",
        bottomLeft: "bottom-1 -left-1",
        bottomRight: "bottom-1 right-1",
        bottomCenter: "bottom-1 left-1/2 -translate-x-1/2 group-hover:translate-y-8",
        topCenter: "-top-1 left-1/2 -translate-x-1/2 group-hover:-translate-y-8"
      },
      size: {
        sm: "size-4",
        md: "size-6",
        lg: "size-8"
      }
    },
    defaultVariants: {
      variant: "bottomCenter",
      size: "md"
    }
  }
);

export interface ClearButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof clearButtonVariants> {}

export function ClearButton(props: ClearButtonProps) {
  const { variant, className, size, ...rest } = props;
  return (
    <button {...rest} className={cn(clearButtonVariants({ variant, size, className }))}>
      <Cross className="size-4" />
    </button>
  );
}

type Img = { url: string; alt?: string; id: string | number };
type ZigZagListProps = React.HTMLProps<HTMLDivElement> & {
  imageCardProps?: (props: { image: Img }) => Omit<React.ComponentProps<typeof ImageCard>, "url">;
  images: Img[];
};

function getRotation(index: number) {
  return index % 2 === 0 ? -6 : 5;
}

export function ZigZagList(props: ZigZagListProps) {
  const { images, imageCardProps, children, ...rest } = props;
  return (
    <div {...rest} className={cn("flex items-center -space-x-16", rest.className)}>
      {images.map((image, index) => (
        <ImageCard
          {...imageCardProps?.({ image })}
          className={cn(
            "peer rotate-[var(--rotate)] transition-all duration-300",
            "hover:rotate-0 peer-hover:translate-x-[4rem] peer-hover:rotate-0",
            imageCardProps?.({ image }).className
          )}
          style={
            {
              "--rotate": `${getRotation(index)}deg`,
              ...(imageCardProps?.({ image }).style || {})
            } as React.CSSProperties
          }
          url={image.url}
          key={index}
        />
      ))}
      {children}
    </div>
  );
}

type LoadingStatus = "loading" | "loaded" | "error" | "idle";

function useImageLoadingStatus(src: string | undefined) {
  const isHydrated = useIsHydrated();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const image = (() => {
    if (!isHydrated) return null;
    if (!imageRef.current) {
      imageRef.current = new window.Image();
    }
    return imageRef.current;
  })();

  const [status, setStatus] = useState<LoadingStatus>(() => loadingStatusFromImage(image, src));

  useLayoutEffect(() => {
    setStatus(loadingStatusFromImage(image, src));
  }, [image, src]);

  useLayoutEffect(() => {
    if (!image) return;
    const handleLoaded = () => setStatus("loaded");
    const handleError = () => setStatus("error");
    image.addEventListener("load", handleLoaded);
    image.addEventListener("error", handleError);
    // eslint-disable-next-line consistent-return
    return () => {
      image.removeEventListener("load", handleLoaded);
      image.removeEventListener("error", handleError);
    };
  }, [image]);

  return status;
}

function loadingStatusFromImage(image: HTMLImageElement | null, src?: string): LoadingStatus {
  if (!image) return "idle";
  if (!src) return "error";
  if (image.src !== src) {
    image.src = src;
  }
  return image.complete && image.naturalHeight !== 0 ? "loaded" : "loading";
}
