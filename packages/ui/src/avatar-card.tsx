import { cn } from "./cn";
import { Cross } from "./icons/cross";
import { ImageBackCards, ImageCard } from "./image-card";

type Props = React.ComponentProps<typeof ImageCard>;

export function AvatarCard(props: Props) {
  return <ImageCard {...props} />;
}

export function AvatarBackCards() {
  return <ImageBackCards />;
}

export function AvatarClearButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "absolute z-[2] flex opacity-0 items-center justify-center bottom-0 left-1/2 -translate-x-1/2 size-6 p-1 rounded-full bg-nobelBlack-200 border border-black-400 group-hover:translate-y-8 group-hover:opacity-100 transition-[transform_,_opacity] duration-300 hover:scale-150 hover:rotate-180",
        props.className
      )}
    >
      <Cross className="size-4" />
    </button>
  );
}
