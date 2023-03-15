import React from "react";

import { AvatarUploader, Loader } from "@votewise/ui";

import { usePicker } from "lib/hooks/usePicker";

export function AvatarPicker(props: { onSuccess: (url: string) => void }) {
  const { onSuccess } = props;
  const { handleOnReady, handleOnError, status, error } = usePicker(onSuccess);
  return (
    <>
      <AvatarUploader
        onReady={handleOnReady}
        onError={handleOnError}
        config={{ fileSizes: { max: 1024 * 1024, min: 5 * 1024 } }}
        hideLabel={status === "pending"}
      />
      {status === "pending" && (
        <div className="mt-1 flex items-center justify-center">
          <p className="mr-2 text-green-600">Uploading your profile pic...</p>
          <Loader loaderColor="#0284c7" className="h-4 w-4" />
        </div>
      )}
      {error && <p className="text-center text-red-600">{error}</p>}
    </>
  );
}
