import { CommentInput, CommentList, Comments } from "@votewise/ui/cards/comment";
import { Spinner } from "@votewise/ui/ring-spinner";

export function CommentsFetcherFallback() {
  return (
    <Comments>
      <CommentInput disabled style={{ height: 40 }} />
      <CommentList className="min-h-28 justify-center">
        <div className="flex flex-col gap-1 items-center">
          <span className="text-sm text-gray-400">Retrieving thoughts that people typed and didn&apos;t delete...</span>
          <Spinner className="size-5" />
        </div>
      </CommentList>
    </Comments>
  );
}
