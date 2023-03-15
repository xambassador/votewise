import React from "react";

import { CoverUploader, Loader } from "@votewise/ui";

import { usePicker } from "lib/hooks/usePicker";

export function CoverPicker(props: { onSuccess: (url: string) => void }) {
  const { onSuccess } = props;
  const { handleOnReady, handleOnError, status, error } = usePicker(onSuccess);

  return (
    <>
      <CoverUploader
        onReady={handleOnReady}
        onError={handleOnError}
        hideLabel={status === "pending"}
        config={{ fileSizes: { min: 5 * 1024 } }}
      />
      {status === "pending" && (
        <div className="mt-1 flex items-center justify-center">
          <p className="mr-2 text-green-600">Uploading your cover pic...</p>
          <Loader loaderColor="#0284c7" className="h-4 w-4" />
        </div>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}
    </>
  );
}
