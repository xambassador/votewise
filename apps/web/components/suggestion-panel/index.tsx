import { Logo } from "../logo";
import { SearchBox } from "./search-box";
import { SuggestedGroups } from "./suggested-groups";
import { SuggestedUsers } from "./suggested-users";

export function SuggestionPanel() {
  return (
    <aside className="hidden flex-1 suggestions-panel-max-width border-l border-nobelBlack-200 pl-4 pt-7 xl:flex flex-col gap-4 max-h-screen sticky top-0">
      <Logo />
      <div className="pb-5 border-b border-nobelBlack-200">
        <SearchBox />
      </div>
      <SuggestedUsers />
      <SuggestedGroups />
    </aside>
  );
}
