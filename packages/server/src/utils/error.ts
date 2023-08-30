export const getErrorReason = (err: unknown) => {
  if (err instanceof Error) {
    return err.message;
  }
  return null;
};
