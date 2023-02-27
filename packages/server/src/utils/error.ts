// Return valid error message from error object or null if it's not an error object.
export const getErrorReason = (err: unknown) => {
  if (err instanceof Error) {
    return err.message;
  }
  return null;
};
