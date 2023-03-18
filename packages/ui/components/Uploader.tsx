import Image from "next/image";

import React, { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";

export function Thumbnail({
  file,
  render,
}: {
  file: File | null;
  render: (url: string | null) => ReactNode;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    // if file is image, create a preview
    if (file.type.startsWith("image")) {
      setUrl(URL.createObjectURL(file));
    }
  }, [file]);

  return <>{render(url)}</>;
}

type FileInputProps = React.HTMLAttributes<HTMLInputElement>;

function FileInput(props: FileInputProps) {
  return <input type="file" accept="image/*" className="hidden" {...props} />;
}

type UploaderProps = {
  onReady: (file: File) => void;
  onError?: (error: string) => void;
  hideLabel?: boolean;
  config?: {
    fileSizes?: {
      max?: number;
      min?: number;
    };
  };
};

export function AvatarUploader(props: UploaderProps) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const { onReady, onError, config, hideLabel } = props;

  const defaultConfigs = {
    fileSize: {
      max: 5 * 1024 * 1024, // 5MB
      min: 100 * 1024,
      ...config?.fileSizes,
    },
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFile = e.target.files?.[0];
    if (!uploadFile) return;
    if (uploadFile.size > defaultConfigs.fileSize.max) {
      onError?.(`File size must be less than ${defaultConfigs.fileSize.max / 1024 / 1024}MB`);
      return;
    }
    if (uploadFile.size < defaultConfigs.fileSize.min) {
      onError?.(`File size must be greater than ${defaultConfigs.fileSize.min / 1024}KB`);
      return;
    }
    setFile(uploadFile);
  };

  const getThumbnailElement = (url: string | null) => (
    <div className="relative h-[calc((100/16)*1rem)] w-[calc((100/16)*1rem)] overflow-hidden rounded-full bg-blue-900">
      {url && <Image src={url} alt="Avatar" fill style={{ objectFit: "cover" }} />}
    </div>
  );

  useEffect(() => {
    if (!file) return;
    onReady(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Thumbnail file={file} render={getThumbnailElement} />
        <FileInput id={id} onChange={handleOnChange} />
        {!hideLabel && (
          <label className="cursor-pointer text-blue-600" htmlFor={id}>
            Upload your profile pic
          </label>
        )}
      </div>
    </div>
  );
}

export function CoverUploader(props: UploaderProps) {
  const id = useId();
  const [file, setFile] = useState<File | null>(null);
  const { onReady, onError, config, hideLabel } = props;

  const defaultConfigs = {
    fileSize: {
      max: 5 * 1024 * 1024, // 5MB
      min: 100 * 1024,
      ...config?.fileSizes,
    },
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFile = e.target.files?.[0];
    if (!uploadFile) return;
    if (uploadFile.size > defaultConfigs.fileSize.max) {
      onError?.(`File size must be less than ${defaultConfigs.fileSize.max / 1024 / 1024}MB`);
      return;
    }
    if (uploadFile.size < defaultConfigs.fileSize.min) {
      onError?.(`File size must be greater than ${defaultConfigs.fileSize.min / 1024}KB`);
      return;
    }
    setFile(uploadFile);
  };

  useEffect(() => {
    if (!file) return;
    onReady(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="flex w-full flex-col gap-3">
      <Thumbnail
        file={file}
        render={(url) => (
          <div className="relative h-[calc((100/16)*1rem)] w-full overflow-hidden rounded-lg bg-blue-900 object-cover">
            {url && <Image src={url} alt="Cover" fill style={{ objectFit: "cover" }} />}
          </div>
        )}
      />

      <FileInput id={id} onChange={handleOnChange} />

      {!hideLabel && (
        <label className="cursor-pointer text-center text-blue-600" htmlFor={id}>
          Looks good? Change it
        </label>
      )}
    </div>
  );
}
