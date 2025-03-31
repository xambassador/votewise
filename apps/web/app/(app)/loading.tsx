import { Spinner } from "@votewise/ui/ring-spinner";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-58px)] flex flex-col items-center justify-center">
      <Spinner />
    </div>
  );
}
