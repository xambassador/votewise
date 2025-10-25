"use client";

import { useId, useRef } from "react";
import { useRouter } from "next/navigation";

import { UserSearch } from "@votewise/ui/icons/user-search";
import { Input, InputField } from "@votewise/ui/input-field";

import { routes } from "@/lib/routes";

export function SearchBox() {
  const id = useId();
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(ref.current!);
    const searchQuery = formData.get("search") as string;
    ref.current?.reset();
    if (!searchQuery) return;
    router.push(routes.search.withQuery(searchQuery));
  }

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <InputField className="h-10">
        <UserSearch className="text-gray-500" />
        <Input placeholder="Search" className="placeholder:text-gray-500 text-sm font-medium" name="search" id={id} />
      </InputField>
    </form>
  );
}
