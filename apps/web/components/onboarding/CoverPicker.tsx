import React, { forwardRef } from "react";

import { CoverUploader, Loader } from "@votewise/ui";

import { usePicker } from "lib/hooks/usePicker";

type CoverPickerProps = {
  onSuccess: (url: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const CoverPicker = forwardRef<HTMLDivElement, CoverPickerProps>((props, ref) => {
  const { onSuccess, ...rest } = props;
  const { handleOnReady, handleOnError, status, error } = usePicker(onSuccess);

  return (
    <div ref={ref} {...rest}>
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
    </div>
  );
});
