import { useState } from "react";

import { useUploader } from "./useUploader";

const BASE_URL = process.env.NEXT_PUBLIC_STATIC_UPLOAD_SERVER_URL;
const UPLOAD_URL = `${BASE_URL}/upload`;
const HANDSHAKE_URL = `${BASE_URL}/handshake`;

export function usePicker(onSuccess: (url: string) => void) {
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "resolved" | "rejected">("idle");

  useUploader(image, {
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
  });

  const handleOnReady = (file: File) => {
    setError(null);
    setStatus("pending");
    setImage(file);
  };

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
