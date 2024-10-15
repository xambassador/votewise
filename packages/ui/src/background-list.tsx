"use client";

import { ScrollArea } from "./scroll-area";

/* ----------------------------------------------------------------------------------------------- */

type Background = {
  url: string;
  name: string;
  etag: string;
};

const backgroundList: Background[] = [];

function prefetchImages() {
  if (typeof window === "undefined") return;
  fetch("/api/upload/assets/backgrounds").then((res) => {
    if (res.ok) {
      res.json().then((data) => {
        backgroundList.push(...data);
      });
    }
  });
}

prefetchImages();

type Props = {
  onSelect?: (background: string) => void;
};

export function BackgroundList(props: Props) {
  const { onSelect } = props;

  return (
    <ScrollArea className="bg-nobelBlack-200 rounded-3xl border border-black-400 max-h-[calc((480/16)*1rem)]">
      <div className="items-center justify-center px-4 py-8 flex flex-wrap gap-7">
        {backgroundList.map((bg) => (
          <button key={bg.etag} onClick={() => onSelect?.(bg.url)}>
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
