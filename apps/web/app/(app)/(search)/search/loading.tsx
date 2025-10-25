import { Search } from "@votewise/ui/icons/search";
import { Input, InputField } from "@votewise/ui/input-field";

import { SearchSkeleton } from "./_components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <InputField>
        <button aria-label="Search" type="submit" className="focus-presets focus-primary">
          <Search className="text-gray-500" />
        </button>
        <Input disabled placeholder="Search" name="search" id="search" />
      </InputField>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SearchSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
