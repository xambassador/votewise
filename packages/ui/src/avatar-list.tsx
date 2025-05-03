"use client";

import { ScrollArea } from "./scroll-area";

/* ----------------------------------------------------------------------------------------------- */

type Avatar = {
  url: string;
  name: string;
  etag: string;
  path: string;
};

const avatarList: Avatar[] = [];
let errorDuringPrefetch = false;
let error: null | string = null;

function prefetchImages() {
  if (typeof window === "undefined") return;
  fetch("/api/upload/assets/avatars", { credentials: "include" }).then((res) => {
    if (res.ok) {
      res.json().then((data) => {
        avatarList.push(...data);
      });
    } else {
      errorDuringPrefetch = true;
      error = `Oops, looks like the server has gone on a coffee break ☕. Try again in a bit!`;
    }
  });
}

prefetchImages();

type Props = {
  onSelect?: (url: string) => void;
  avatarList?: Avatar[];
};

export function AvatarList(props: Props) {
  const { onSelect, avatarList: _avatarList } = props;
  let list: Avatar[] | null = null;

  if (errorDuringPrefetch) {
    if (_avatarList) list = _avatarList;
  } else {
    list = avatarList;
  }

  return (
    <ScrollArea className="bg-nobelBlack-200 rounded-3xl border border-black-400 max-h-[calc((480/16)*1rem)]">
      <div className="items-center justify-center px-4 py-8 flex flex-wrap gap-7">
        {!list ? (
          <div className="text-red-500">{error}</div>
        ) : (
          list.map((avatar) => (
            <button key={avatar.etag} onClick={() => onSelect?.(avatar.url)}>
              <figure className="size-[calc((60/16)*1rem)] rounded-full overflow-hidden border-2 border-red-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar.url}
                  alt="avatar"
                  className="size-full object-cover hover:scale-125 transition-transform duration-300"
                />
              </figure>
            </button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
