import React from "react";

export function AvatarUploader() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-[calc((100/16)*1rem)] w-[calc((100/16)*1rem)] rounded-full bg-blue-900" />
        <button className="text-blue-600" type="button">
          Upload your profile pic
        </button>
      </div>
    </div>
  );
}

export function CoverUploader() {
  return (
    <div className="flex w-full flex-col gap-3">
      {/* Preview */}
      <div className="h-[calc((100/16)*1rem)] w-full rounded-lg bg-blue-900" />
      <button className="text-blue-600" type="button">
        Looks good? Change it
      </button>
    </div>
  );
}
