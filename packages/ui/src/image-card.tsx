import { cn } from "./cn";

type Props = React.HTMLProps<HTMLDivElement> & {
  url: string;
  figureProps?: React.ComponentProps<"figure">;
};

export function ImageCard(props: Props) {
  const { url, children, figureProps, alt, ...rest } = props;
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
          figureProps?.className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt || "Avatar"} className="size-full object-cover rounded-2xl" />
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

type ZigZagListProps = React.HTMLProps<HTMLDivElement> & {
  imageCardProps?: Omit<React.ComponentProps<typeof ImageCard>, "url">;
  images: { url: string; alt?: string }[];
};

function getRotation(index: number) {
  return index % 2 === 0 ? -6 : 5;
}

export function ZigZagList(props: ZigZagListProps) {
  const { images, imageCardProps, ...rest } = props;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error - I know url is omitted.. 😛
  const { url: _omittedUrl, ...restProps } = imageCardProps || {};

  return (
    <div {...rest} className={cn("flex items-center -space-x-16", rest.className)}>
      {images.map((image, index) => (
        <ImageCard
          {...restProps}
          style={{
            transform: `rotate(${getRotation(index)}deg)`,
            ...imageCardProps?.style
          }}
          url={image.url}
          key={index}
        />
      ))}
    </div>
  );
}
