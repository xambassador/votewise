import type { FetchError, FetchResult } from "@votewise/types";

import { makeToast } from "@votewise/ui/toast";

function isSandboxError(error: FetchError): boolean {
  return error.errorData.name === "SandboxError";
}

const generalErrorTitle = "An error occurred";
const sandboxErrorTitle = "Action not allowed";
const unknownErrorMessage = "An unknown error occurred";

export function kindOfError(error: unknown) {
  if (error instanceof SandboxError) {
    const isSandbox = error.name === "SandboxError";
    return {
      isSandbox,
      isUnknown: false,
      message: error.message,
      title: isSandbox ? sandboxErrorTitle : generalErrorTitle
    };
  }

  if (error instanceof Error) {
    return { isSandbox: false, isUnknown: false, message: error.message, title: generalErrorTitle };
  }

  return { isSandbox: false, isUnknown: true, message: unknownErrorMessage, title: generalErrorTitle };
}

class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxError";
  }
}

export function assertResponse<T>(response: FetchResult<T>): T {
  if (!response.success) {
    if (isSandboxError(response)) {
      throw new SandboxError(response.error);
    }
    throw new Error(response.error);
  }
  return response.data;
}

export function renderErrorToast(error: unknown, opts?: { onSandboxError?: () => void; showOnSandboxError?: boolean }) {
  const showOnSandboxError = opts?.showOnSandboxError ?? true;
  if (error && typeof error === "object" && "errorData" in error) {
    const fetchError = error as FetchError;
    const isSandbox = isSandboxError(fetchError);
    const { title, message } = kindOfError(
      isSandbox ? new SandboxError(fetchError.error) : new Error(fetchError.error)
    );
    if (isSandbox && opts?.onSandboxError) {
      opts.onSandboxError();
    }
    if (isSandbox && !showOnSandboxError) {
      return;
    }
    makeToast.error(title, message);
    return;
  }

  const { title, message, isSandbox } = kindOfError(error);
  if (isSandbox && opts?.onSandboxError) {
    opts.onSandboxError();
  }

  if (isSandbox && !showOnSandboxError) {
    return;
  }

  makeToast.error(title, message);
}
