import { useEffect, useRef, useState } from "react";

// ------------------------------------------------------------------------------------------
const FILE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  ERROR: "error",
  COMPLETE: "complete",
  PAUSED: "paused",
  FAILED: "failed",
  IDLE: "idle",
};

interface IFile extends File {
  percentage?: number;
}

type Config = {
  uploadUrl: string;
  handshakeUrl: string;
  deleteUrl: (token: string, filename: string) => string;
  uploadStatusUrl: (token: string, filename: string) => string;
  onProgress?: (e: ProgressEvent<EventTarget>, loaded: number, filesize: number) => void;
  onPaused?: () => void;
  onResumed?: () => void;
  onRetry?: () => void;
  onError?: () => void;
  onAbort?: () => void;
  onComplete?: (response: {
    data: {
      url: string;
    };
    message: string;
    success: boolean;
  }) => void;
  onRemove?: () => void;
};

export function useUploader(file: IFile | null, config: Config) {
  const [request, setRequest] = useState<XMLHttpRequest | null>(null);
  const [status, setStatus] = useState(FILE_STATUS.IDLE);
  const [uploadedBytes, setUploadedBytes] = useState(0);

  // ----------
  const tokenRef = useRef<string | null | undefined>(null);

  // ----------
  // onprogress event handler
  const handleOnProgress = (e: ProgressEvent<EventTarget>, loaded: number, filesize: number) => {
    if (!file) return;
    const per = Math.round((loaded / filesize) * 100);
    // eslint-disable-next-line no-param-reassign
    file.percentage = per;
    setUploadedBytes(loaded);
    config.onProgress?.(e, loaded, filesize);
  };

  // ----------
  // onPaused event handler
  const handleOnPause = () => {
    request?.abort();
    setStatus(FILE_STATUS.PAUSED);
    config.onPaused?.();
  };

  // ----------
  // onResumed event handler
  const handleOnResume = () => {
    if (!file) return;
    setStatus(FILE_STATUS.PENDING);
    fetch(config.uploadStatusUrl(tokenRef.current as string, file.name))
      .then((res) => res.json())
      .then((res) => {
        setStatus(FILE_STATUS.UPLOADING);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        uploadFileInChunks(tokenRef.current as string, res.totalChunkUploaded);
      })
      .catch(() => {
        setStatus(FILE_STATUS.FAILED);
      });
    config.onResumed?.();
  };

  // ----------
  // onRetry event handler
  const handleOnRetry = () => {
    if (!file) return;
    setStatus(FILE_STATUS.PENDING);
    fetch(config.uploadStatusUrl(tokenRef.current as string, file.name))
      .then((res) => res.json())
      .then((res) => {
        setStatus(FILE_STATUS.UPLOADING);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        uploadFileInChunks(tokenRef.current as string, res.totalChunkUploaded);
      })
      .catch(() => {});
    config.onRetry?.();
  };

  // ----------
  // onerror event handler
  const handleOnError = () => setStatus(FILE_STATUS.ERROR);

  // ----------
  // onabort event handler
  const handleOnAbort = () => setStatus(FILE_STATUS.PAUSED);

  // ----------
  // onload event handler
  const handleOnComplete = (e: ProgressEvent<EventTarget>) => {
    const { response } = e.target as XMLHttpRequest;
    const data = response && JSON.parse(response);
    setStatus(FILE_STATUS.COMPLETE);
    config.onComplete?.(
      data as {
        data: {
          url: string;
        };
        message: string;
        success: boolean;
      }
    );
  };

  // ----------
  const handleOnRemove = () => {
    if (!file) return;
    fetch(config.deleteUrl(tokenRef.current as string, file.name), {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {})
      .catch(() => {});
    config.onRemove?.();
  };

  // ----------
  // Upload the file in small chunks
  const uploadFileInChunks = async (token: string, startingByte: number) => {
    if (!file) return;
    // Create a new request object
    const req = new XMLHttpRequest();
    // Create a new form data object
    const formData = new FormData();
    // Create a new file chunk
    const chunk = file.slice(startingByte);

    // https://developer.mozilla.org/en-US/docs/Web/API/FormData/append#syntax
    formData.append("chunk", chunk, file.name);
    formData.append("token", token);

    // Open the request
    req.open("POST", config.uploadUrl, true);
    // Set the custom request headers
    req.setRequestHeader("X-File-Token", token);
    req.setRequestHeader("X-Filename", file.name);
    // req.setRequestHeader("Content-Length", chunk.size); // Browser set this header for us
    req.setRequestHeader(
      "Content-Range",
      // example: bytes=0-999/10000
      // chunk size = file.size - startingByte
      // For set correct endingByte, need to do startingByte + chunk.size
      // Example: totalByte: 25678, startingByte: 10, endingByte: 10 + (25678 - 10) = 25678
      `bytes=${startingByte}-${startingByte + chunk.size}/${file.size}`
    );

    // after upload is complete
    req.onload = (e: ProgressEvent<EventTarget>) => handleOnComplete(e);
    // when request is send
    req.onloadstart = () => {};
    // when request is finished
    req.onloadend = () => {};

    req.onerror = () => handleOnError();
    req.ontimeout = () => {};
    req.upload.onprogress = (e: ProgressEvent<EventTarget>) => {
      // calculate total loaded bytes by adding startingByte and e.loaded.
      // e.loaded is total uploaded bytes in current request
      const loaded = startingByte + e.loaded;
      handleOnProgress(e, loaded, file.size);
    };
    req.onabort = () => handleOnAbort();
    req.onreadystatechange = () => handleOnError();
    req.send(formData);
    // set request to track it,
    setRequest(req);
  };

  // ----------
  const uploadFile = async () => {
    if (!file) return;
    /**
     Perform handshake with server for initiating an upload request.
     Server generates a unique token for each file and returns it to client.
     */
    setStatus(FILE_STATUS.PENDING);
    fetch(config.handshakeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName: file.name }),
    })
      .then(async (res) => res.json())
      .then(async (res) => {
        /**
         Receiving ok and token in response from server indicating that handshake is complete and client is now
          ready to upload file to server in small chunks.
          Token is used to identify the file on server and for further communication with server.
        */
        tokenRef.current = res.token;
        setStatus(FILE_STATUS.UPLOADING);
        await uploadFileInChunks(res.token as string, 0);
      })
      .catch(() => {
        setStatus(FILE_STATUS.FAILED);
      });
  };

  useEffect(() => {
    if (!file) return;
    uploadFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return {
    status,
    uploadedBytes,
    controls: {
      onPause: handleOnPause,
      onResume: handleOnResume,
      onRemove: handleOnRemove,
      onRetry: handleOnRetry,
    },
  };
}
