import { useCallback, useState } from "react";

import { useUploader } from "./useUploader";

const BASE_URL = process.env.NEXT_PUBLIC_STATIC_UPLOAD_SERVER_URL;
const UPLOAD_URL = `${BASE_URL}/upload`;
const HANDSHAKE_URL = `${BASE_URL}/handshake`;

export function usePicker(
  onSuccess: (url: string) => void,
  onProgress?: (e: ProgressEvent<EventTarget>, loaded: number, filesize: number) => void
) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "resolved" | "rejected">("idle");

  useUploader(file, {
    uploadUrl: UPLOAD_URL as string,
    handshakeUrl: HANDSHAKE_URL as string,
    deleteUrl: (token, filename) => `${UPLOAD_URL}?token=${token}&filename=${filename}`,
    uploadStatusUrl: (token, filename) => `${BASE_URL}/upload-status?token=${token}&filename=${filename}`,
    onComplete: (response) => {
      setStatus("resolved");
      onSuccess(response.data.url);
    },
    onError: () => {
      setStatus("rejected");
    },
    onProgress: (e: ProgressEvent<EventTarget>, loaded, filesize) => {
      onProgress?.(e, loaded, filesize);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleOnReady = useCallback((file: File) => {
    setError(null);
    setStatus("pending");
    setFile(file);
  }, []);

  const handleOnError = (err: string) => {
    setError(err);
  };

  return {
    handleOnError,
    handleOnReady,
    status,
    error,
  };
}
