"use client";

import type { Props } from "@/components/error";

import Error from "@/components/error";

import { OnboardContainer } from "./container";

export default function ErrorBoundary(props: Props) {
  return (
    <OnboardContainer>
      <Error {...props} />
    </OnboardContainer>
  );
}
