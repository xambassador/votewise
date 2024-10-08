import { cn } from "./cn";
import { Cross } from "./icons/cross";

type Props = React.HTMLProps<HTMLDivElement> & {
  url: string;
};

export function AvatarCard(props: Props) {
  const { url, children, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "relative max-w-[calc((200/16)*1rem)] flex items-center justify-center group cursor-pointer",
        rest.className
      )}
    >
      <figure className="relative z-[3] w-[calc((100/16)*1rem)] h-[calc((140/16)*1rem)] bg-nobelBlack-200 rounded-2xl border border-black-400 shadow-image-card p-3 group-hover:translate-y-[-5px] transition-transform duration-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Avatar" className="size-full object-cover rounded-2xl" />
      </figure>
      {children}
    </div>
  );
}

export function AvatarBackCards() {
  return (
    <>
      <div className="absolute z-[1] rotate-[15deg] top-[4px] left-[24px] w-[calc((100/16)*1rem)] h-[calc((140/16)*1rem)] bg-nobelBlack-100 rounded-2xl border border-black-400 shadow-image-card p-3 group-hover:rotate-[25deg] group-hover:translate-x-3 group-hover:border-blue-400 group-hover:bg-nobelBlack-50 transition-all duration-300" />
      <div className="absolute z-[1] rotate-[-15deg] top-[4px] right-[24px] w-[calc((100/16)*1rem)] h-[calc((140/16)*1rem)] bg-nobelBlack-100 rounded-2xl border border-black-400 shadow-image-card p-3 group-hover:rotate-[-25deg] group-hover:-translate-x-3 group-hover:border-blue-400 group-hover:bg-nobelBlack-50 transition-all duration-300" />
    </>
  );
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
