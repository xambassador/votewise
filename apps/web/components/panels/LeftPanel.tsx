import React from "react";

import { SearchField } from "@votewise/ui";

import { UserPill } from "../UserPill";

export function LeftPanel() {
  return (
    <aside className="max-w-[calc((342/16)*1rem)] rounded-lg border border-gray-200 bg-white py-5 px-10">
      <div>
        <SearchField name="search" placeholder="Search people or group" />
      </div>
      <div className="mt-7">
        <h4 className="font-bold uppercase text-gray-600">Favourites</h4>
        <div className="mt-4 flex flex-col gap-4">
          {Array(5)
            .fill(0)
            .map(() => (
              <div key={`item-${new Date()}`}>
                <UserPill
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  username="Selma knight"
                />
              </div>
            ))}
        </div>
      </div>

      <div className="mt-7">
        <h4 className="font-bold uppercase text-gray-600">Groups</h4>
        <div className="mt-4 flex flex-col gap-4">
          {Array(3)
            .fill(0)
            .map(() => (
              <div key={`item-${new Date()}`}>
                <UserPill
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                  username="Selma knight"
                />
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
}
