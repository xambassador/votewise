import React from "react";

import { Avatar, Image, InputField } from "@votewise/ui";

export function Profile() {
  return (
    <div className="flex w-[calc((768/16)*1rem)] max-w-3xl flex-col gap-7 rounded-lg bg-white p-7">
      <div className="relative w-full">
        <figure className="h-60 w-full overflow-hidden rounded-lg">
          <Image
            src="https://images.unsplash.com/photo-1645680827507-9f392edae51c"
            alt="Profile banner"
            width={768}
            height={240}
          />
        </figure>
        <div className="absolute left-1/2 -bottom-8 -translate-x-1/2">
          <Avatar
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
            width={80}
            height={80}
            withStroke
          />
        </div>
      </div>
      <div className="flex felx-col gap-5">
        <InputField name="Email" />
      </div>
    </div>
  );
}
