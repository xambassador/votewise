"use client";

import { ScrollArea } from "./scroll-area";

/* ----------------------------------------------------------------------------------------------- */

type Avatar = {
  url: string;
  id: number;
};

const avatarList: Avatar[] = Array.from({ length: 147 }).map((_, index) => ({
  url: `/votewise-bucket/votewise/assets/avatars/avatar_${index + 1}.png?q=75&w=256`,
  id: index + 1
}));

type Props = {
  onSelect?: (url: string) => void;
  avatarList?: Avatar[];
};

export function AvatarList(props: Props) {
  const { onSelect, avatarList: _avatarList } = props;
  const list = _avatarList || avatarList;

  return (
    <ScrollArea className="bg-nobelBlack-200 rounded-3xl border border-black-400 max-h-[calc((480/16)*1rem)]">
      <div className="items-center justify-center px-4 py-8 flex flex-wrap gap-7">
        {list.map((avatar) => (
          <button key={avatar.id} onClick={() => onSelect?.(avatar.url)}>
            <figure className="size-[calc((60/16)*1rem)] rounded-full overflow-hidden border-2 border-red-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar.url}
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
