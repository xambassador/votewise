"use client";

import { Error } from "@votewise/ui/error";

export type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
} & React.ComponentProps<typeof Error>;

export default function ErrorBoundary(props: Props) {
  const { error, ...rest } = props;
  return <Error error={error.message} errorInfo={{ componentStack: error.stack }} {...rest} />;
}
