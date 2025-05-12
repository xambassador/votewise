"use client";

import { Error } from "@votewise/ui/error";

type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
};

export default function ErrorBoundary(props: Props) {
  const { error } = props;
  return <Error error={error.message} errorInfo={{ componentStack: error.stack }} />;
}
