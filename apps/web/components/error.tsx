"use client";

import { Error } from "@votewise/ui/error";

export type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
} & Omit<React.ComponentProps<typeof Error>, "error">;

export default function ErrorBoundary(props: Props) {
  const { error, ...rest } = props;
  return <Error error={error.message} errorInfo={{ componentStack: error.stack }} {...rest} />;
}
