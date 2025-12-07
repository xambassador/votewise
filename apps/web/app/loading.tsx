import { Spinner } from "@votewise/ui/ring-spinner";

import { getLoadingMessage } from "@/lib/loading-messages";

export default function Loading() {
  return (
    <div className="at-max-viewport center">
      <div className="spinner-with-text-wrapper">
        <Spinner className="md:size-10 size-8" />
        <span className="spinner-text">{getLoadingMessage()}</span>
      </div>
    </div>
  );
}
