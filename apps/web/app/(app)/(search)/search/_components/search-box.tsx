"use client";

import { useRef } from "react";

import { Search } from "@votewise/ui/icons/search";
import { Input, InputField } from "@votewise/ui/input-field";

import { useSearchCtx } from "../_utils/store";

export function SearchBox() {
  const ref = useRef<HTMLFormElement>(null);
  const { setQuery } = useSearchCtx("SearchBox");

  function handleOnSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(ref.current!);
    const searchQuery = formData.get("search") as string;
    if (!searchQuery) return;
    setQuery(searchQuery);
  }

  return (
    <form ref={ref} onSubmit={handleOnSubmit}>
      <InputField>
        <button aria-label="Search" type="submit" className="focus-presets focus-primary">
          <Search className="text-gray-500" />
        </button>
        <Input placeholder="Search" name="search" id="search" />
      </InputField>
    </form>
  );
}
