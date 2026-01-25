"use client";

import { ScrollArea } from "./scroll-area";

/* ----------------------------------------------------------------------------------------------- */

type Background = {
  url: string;
  id: number;
};

const backgroundList: Background[] = Array.from({ length: 10 }).map((_, index) => ({
  url: `/votewise-bucket/votewise/assets/backgrounds/bg_${index + 1}.png?q=75&w=256`,
  id: index + 1
}));

type Props = {
  onSelect?: (background: string) => void;
  backgroundList?: Background[];
};

export function BackgroundList(props: Props) {
  const { onSelect, backgroundList: _backgroundList } = props;
  const list = _backgroundList || backgroundList;

  return (
    <ScrollArea className="bg-nobelBlack-200 rounded-3xl border border-black-400 max-h-[calc((480/16)*1rem)]">
      <div className="items-center justify-center px-4 py-8 flex flex-wrap gap-7">
        {list.map((bg) => (
          <button key={bg.id} onClick={() => onSelect?.(bg.url)}>
            <figure className="size-[calc((60/16)*1rem)] rounded-full overflow-hidden border-2 border-red-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bg.url}
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
