"use client";

import { useState, useTransition } from "react";

import { Button } from "@votewise/ui/button";
import { makeToast } from "@votewise/ui/toast";

import { Footer } from "@/app/onboard/_components/footer";
import { onboard } from "@/app/onboard/action";

import { routes } from "@/lib/routes";

type Props = { topics: { id: string; name: string }[] };

export function Topics(props: Props) {
  const { topics } = props;
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function onSelect(id: string) {
    const isSelected = selected.includes(id);
    if (isSelected) {
      setSelected((prev) => prev.filter((item) => item !== id));
      return;
    }
    setSelected((prev) => [...prev, id]);
  }

  function onSubmit() {
    if (selected.length < 3) {
      makeToast.error("Nope!", "Please select at least 3 topics.");
      return;
    }

    startTransition(async () => {
      const res = await onboard({ topics: selected, step: 6, isDirty: true });
      if (!res.success) {
        makeToast.error("Oops!", res.error);
      }
    });
  }

  const isSelected = (id: string) => selected.includes(id);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center flex-wrap gap-4 justify-center">
        {topics.map((topic) => {
          const isTopicSelected = isSelected(topic.id);
          return (
            <Button
              variant={isTopicSelected ? "secondary" : "outline"}
              key={topic.id}
              onClick={() => onSelect(topic.id)}
            >
              {topic.name}
              {isTopicSelected && <span className="absolute top-0 right-0 size-2 rounded-full bg-green-500" />}
            </Button>
          );
        })}
      </div>
      <Footer nextProps={{ onClick: onSubmit, loading: isPending }} backProps={{ href: routes.onboard.step5() }} />
    </div>
  );
}
