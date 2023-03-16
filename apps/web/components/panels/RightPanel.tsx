import React from "react";
import type { ReactNode } from "react";

import { FiUserPlus as UserPlus } from "@votewise/ui/icons";

import { UserPill } from "../UserPill";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-[calc((324/16)*1rem)] max-w-[calc((324/16)*1rem)] rounded-lg border border-gray-200 bg-white">
      <div className="w-full px-8 py-6">{children}</div>
    </div>
  );
}

// TODO: Move to a separate file
export function UserRecommendations() {
  return (
    <Wrapper>
      <div>
        <h1 className="font-bold uppercase text-gray-600">Recommendations</h1>
        <ul className="mt-4">
          <li className="flex items-center justify-between">
            <UserPill
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
              username="Nensi"
              usernameProps={{
                className: "font-medium",
              }}
            />
            <button type="button">
              <UserPlus className="h-6 w-6 text-gray-500" />
            </button>
          </li>
        </ul>
      </div>
    </Wrapper>
  );
}

export function RightPanel({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-7">{children}</div>;
}
