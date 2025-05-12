"use client";

import { Error } from "@votewise/ui/error";

import { OnboardContainer } from "../_components/container";

type Props = {
  error: Error & { digest?: string };
  reset?: () => void;
};

export default function ErrorBoundary(props: Props) {
  const { error } = props;
  return (
    <OnboardContainer>
      <Error error={error.message} errorInfo={{ componentStack: error.stack }} />
    </OnboardContainer>
  );
}
