import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import { getSearchClient } from "@/lib/client.server";
import { getSearchKey } from "@/lib/constants";

import { SearchList } from "./_components/search-list";

type Props = {
  searchParams: { query?: string };
};

export default async function Page(props: Props) {
  const client = getSearchClient();
  const queryClient = new QueryClient();

  if (props.searchParams.query) {
    await queryClient.fetchQuery({
      queryKey: getSearchKey(props.searchParams.query ?? ""),
      queryFn: async () => {
        const res = await client.search(props.searchParams.query ?? "");
        if (!res.success) {
          throw new Error(res.error);
        }
        return res.data;
      },
      retry: 0
    });

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SearchList />
      </HydrationBoundary>
    );
  }

  return <SearchList />;
}
