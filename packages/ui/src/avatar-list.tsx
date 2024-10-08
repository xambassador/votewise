"use client";

import { ScrollArea } from "./scroll-area";

const votewiseAvatars = Array.from({ length: 133 }).map((_, i) => ({
  id: i,
  src: `/votewise-bucket/votewise/assets/avatars/avatar_${i + 1}.png`
}));

type Props = {
  onSelect?: (avatar: string) => void;
};

export function AvatarList(props: Props) {
  const { onSelect } = props;

  return (
    <ScrollArea className="bg-nobelBlack-200 rounded-3xl border border-black-400 max-h-[calc((480/16)*1rem)]">
      <div className="items-center justify-center px-4 py-8 flex flex-wrap gap-7">
        {votewiseAvatars.map((avatar) => (
          <button key={avatar.id} onClick={() => onSelect?.(avatar.src)}>
            <figure className="size-[calc((60/16)*1rem)] rounded-full overflow-hidden border-2 border-red-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar.src}
                alt="avatar"
                className="size-full object-cover hover:scale-125 transition-transform duration-300"
              />
            </figure>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
