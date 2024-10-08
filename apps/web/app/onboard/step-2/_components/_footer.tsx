"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

import { Button } from "@votewise/ui/button";

export function Footer() {
  const router = useRouter();

  function onNext() {
    router.push(routes.onboard.step3());
  }

  function onBack() {
    router.push(routes.onboard.step1());
  }

  return (
    <div className="flex flex-col gap-5">
      <Button onClick={onNext}>Next</Button>
      <Button onClick={onBack} variant="secondary">
        Back
      </Button>
    </div>
  );
}
