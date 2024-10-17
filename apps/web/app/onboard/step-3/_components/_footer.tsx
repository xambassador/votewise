"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

import { Button } from "@votewise/ui/button";

export function Footer() {
  const router = useRouter();

  function onNext() {
    router.push(routes.onboard.step4());
  }

  function onBack() {
    router.push(routes.onboard.step2());
  }

  return (
    <div className="flex flex-col gap-5">
      <Button onClick={onNext}>Next</Button>
      <Button variant="secondary" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
