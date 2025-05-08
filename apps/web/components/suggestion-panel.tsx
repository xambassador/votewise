import Image from "next/image";

import { UserSearch } from "@votewise/ui/icons/user-search";
import { Input, InputField } from "@votewise/ui/input-field";

import Logo from "@/assets/images/logo.png";

import { SuggestedGroups } from "./suggested-groups";
import { SuggestedUsers } from "./suggested-users";

export function SuggestionPanel() {
  return (
    <aside className="flex-1 max-w-[calc((270/16)*1rem)] border-l border-nobelBlack-200 pl-4 pt-7 flex flex-col gap-4 max-h-screen sticky top-0">
      <div className="pb-2 border-b border-nobelBlack-200 flex items-center justify-end">
        <Image src={Logo} alt="Votewise" />
      </div>

      <div className="pb-5 border-b border-nobelBlack-200">
        <InputField className="h-10">
          <UserSearch className="text-gray-500" />
          <Input placeholder="Search" className="placeholder:text-gray-500 text-sm font-medium" />
        </InputField>
      </div>

      <SuggestedUsers />
      <SuggestedGroups />
    </aside>
  );
}
