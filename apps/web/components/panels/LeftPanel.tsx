import React from "react";

import { SearchField } from "@votewise/ui";

import { UserPill } from "../UserPill";

export function LeftPanel() {
  return (
    <aside className="sticky top-[calc((150/16)*1rem)] h-fit max-h-[calc((700/16)*1rem)] max-w-[calc((342/16)*1rem)] overflow-hidden rounded-lg border border-gray-200 bg-white py-5 px-10">
      <div>
        <SearchField name="search" placeholder="Search people or group" />
      </div>
      <div className="mt-7">
        <h4 className="font-bold uppercase text-gray-600">Favourites</h4>
        <div className="mt-4 flex flex-col gap-4">
          <div key={`item-${new Date()}`}>
            <UserPill
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              username="Selma knight"
            />
          </div>
        </div>
      </div>

      <div className="mt-7">
        <h4 className="font-bold uppercase text-gray-600">Groups</h4>
        <div className="mt-4 flex flex-col gap-4">
          <div key={`item-${new Date()}`}>
            <UserPill
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              username="Selma knight"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
